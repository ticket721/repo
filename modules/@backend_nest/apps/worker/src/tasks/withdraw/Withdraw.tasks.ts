import { InjectQueue } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { InstanceSignature, OutrospectionService } from '@lib/common/outrospection/Outrospection.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { AuthorizationsService } from '@lib/common/authorizations/Authorizations.service';
import { NestError } from '@lib/common/utils/NestError';
import { Injectable, OnModuleInit } from '@nestjs/common';
import {
    WithdrawTransactionConfirmed,
    WithdrawTransactionFailure,
} from '@app/worker/tasks/withdraw/Withdraw.tasks.types';

/**
 * List of tasks for the Withdraw use cases
 */
@Injectable()
export class WithdrawTasks implements OnModuleInit {
    /**
     * Dependency Injection
     *
     * @param outrospectionService
     * @param txQueue
     * @param shutdownService
     * @param authorizationsService
     */
    constructor(
        private readonly authorizationsService: AuthorizationsService,
        private readonly outrospectionService: OutrospectionService,
        private readonly shutdownService: ShutdownService,
        @InjectQueue('tx') private readonly txQueue: Queue,
    ) {}

    /**
     * Tx Lifecycle task when withdraw succeeds
     *
     * @param job
     */
    async onWithdrawTransactionConfirmation(job: Job<WithdrawTransactionConfirmed>): Promise<void> {
        const authorizationUpdateRes = await this.authorizationsService.update(
            {
                id: job.data.authorizationId,
                granter: job.data.granter,
                grantee: job.data.grantee,
                mode: 'withdraw',
            },
            {
                consumed: true,
            },
        );

        if (authorizationUpdateRes.error) {
            throw new NestError('Unable to set authorization to consumed');
        }
    }

    /**
     * Tx Lifecycle task when withdraw fails
     *
     * @param job
     */
    async onWithdrawTransactionFailure(job: Job<WithdrawTransactionFailure>): Promise<void> {
        const authorizationUpdateRes = await this.authorizationsService.update(
            {
                id: job.data.authorizationId,
                granter: job.data.granter,
                grantee: job.data.grantee,
                mode: 'withdraw',
            },
            {
                cancelled: true,
            },
        );

        if (authorizationUpdateRes.error) {
            throw new NestError('Unable to set authorization to cancelled');
        }
    }

    /**
     * Subscribes worker instances only
     */

    /* istanbul ignore next */
    async onModuleInit(): Promise<void> {
        const signature: InstanceSignature = await this.outrospectionService.getInstanceSignature();

        if (signature.name === 'worker') {
            this.txQueue
                .process('@withdraw/confirmation', 10, this.onWithdrawTransactionConfirmation.bind(this))
                .then(() => console.log(`Closing Bull Queue @@tx`))
                .catch(this.shutdownService.shutdownWithError);

            this.txQueue
                .process('@withdraw/failure', 10, this.onWithdrawTransactionFailure.bind(this))
                .then(() => console.log(`Closing Bull Queue @@tx`))
                .catch(this.shutdownService.shutdownWithError);
        }
    }
}
