import { WithdrawTasks } from '@app/worker/tasks/withdraw/Withdraw.tasks';
import { OutrospectionService } from '@lib/common/outrospection/Outrospection.service';
import { getQueueToken } from '@nestjs/bull';
import { Job, JobOptions } from 'bull';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { AuthorizationsService } from '@lib/common/authorizations/Authorizations.service';
import { deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { Test } from '@nestjs/testing';
import { AuthorizationEntity } from '@lib/common/authorizations/entities/Authorization.entity';
import { NestError } from '@lib/common/utils/NestError';
import { WithdrawTransactionConfirmed } from '@app/worker/tasks/withdraw/Withdraw.tasks.types';

class QueueMock<T = any> {
    add(name: string, data: T, opts?: JobOptions): Promise<Job<T>> {
        return null;
    }
}

describe('Withdraw Tasks', function() {
    const context: {
        withdrawTasks: WithdrawTasks;
        outrospectionServiceMock: OutrospectionService;
        txQueueMock: QueueMock;
        shutdownServiceMock: ShutdownService;
        authorizationsServiceMock: AuthorizationsService;
    } = {
        withdrawTasks: null,
        outrospectionServiceMock: null,
        txQueueMock: null,
        shutdownServiceMock: null,
        authorizationsServiceMock: null,
    };

    beforeEach(async function() {
        context.outrospectionServiceMock = mock(OutrospectionService);
        context.txQueueMock = mock(QueueMock);
        context.shutdownServiceMock = mock(ShutdownService);
        context.authorizationsServiceMock = mock(AuthorizationsService);

        const app = await Test.createTestingModule({
            providers: [
                {
                    provide: getQueueToken('tx'),
                    useValue: instance(context.txQueueMock),
                },
                {
                    provide: OutrospectionService,
                    useValue: instance(context.outrospectionServiceMock),
                },
                {
                    provide: ShutdownService,
                    useValue: instance(context.shutdownServiceMock),
                },
                {
                    provide: AuthorizationsService,
                    useValue: instance(context.authorizationsServiceMock),
                },
                WithdrawTasks,
            ],
        }).compile();

        context.withdrawTasks = app.get<WithdrawTasks>(WithdrawTasks);
    });

    describe('onWithdrawTransactionConfirmation', function() {
        it('should properly update authorization', async function() {
            const authorizationId = '843b5030-ee31-40f2-b9e0-d1d89cb70760';
            const granter = '0x14bB2bB081b6B604394b41fF23Eb023A295dFa04';
            const grantee = '0x98AD263a95F1ab1AbFF41F4D44b07c3240251A0a';

            const job = {
                data: {
                    authorizationId,
                    granter,
                    grantee,
                },
            } as Job<WithdrawTransactionConfirmed>;

            when(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: authorizationId,
                        granter,
                        grantee,
                        mode: 'withdraw',
                    }),
                    deepEqual({
                        consumed: true,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {} as AuthorizationEntity,
            });

            await context.withdrawTasks.onWithdrawTransactionConfirmation(job);

            verify(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: authorizationId,
                        granter,
                        grantee,
                        mode: 'withdraw',
                    }),
                    deepEqual({
                        consumed: true,
                    }),
                ),
            ).times(1);
        });

        it('should throw on update error', async function() {
            const authorizationId = '843b5030-ee31-40f2-b9e0-d1d89cb70760';
            const granter = '0x14bB2bB081b6B604394b41fF23Eb023A295dFa04';
            const grantee = '0x98AD263a95F1ab1AbFF41F4D44b07c3240251A0a';

            const job = {
                data: {
                    authorizationId,
                    granter,
                    grantee,
                },
            } as Job<WithdrawTransactionConfirmed>;

            when(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: authorizationId,
                        granter,
                        grantee,
                        mode: 'withdraw',
                    }),
                    deepEqual({
                        consumed: true,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(context.withdrawTasks.onWithdrawTransactionConfirmation(job)).rejects.toMatchObject(
                new NestError('Unable to set authorization to consumed'),
            );

            verify(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: authorizationId,
                        granter,
                        grantee,
                        mode: 'withdraw',
                    }),
                    deepEqual({
                        consumed: true,
                    }),
                ),
            ).times(1);
        });
    });

    describe('onWithdratTransactionFailure', function() {
        it('should properly update authorization', async function() {
            const authorizationId = '843b5030-ee31-40f2-b9e0-d1d89cb70760';
            const granter = '0x14bB2bB081b6B604394b41fF23Eb023A295dFa04';
            const grantee = '0x98AD263a95F1ab1AbFF41F4D44b07c3240251A0a';

            const job = {
                data: {
                    authorizationId,
                    granter,
                    grantee,
                },
            } as Job<WithdrawTransactionConfirmed>;

            when(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: authorizationId,
                        granter,
                        grantee,
                        mode: 'withdraw',
                    }),
                    deepEqual({
                        cancelled: true,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {} as AuthorizationEntity,
            });

            await context.withdrawTasks.onWithdrawTransactionFailure(job);

            verify(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: authorizationId,
                        granter,
                        grantee,
                        mode: 'withdraw',
                    }),
                    deepEqual({
                        cancelled: true,
                    }),
                ),
            ).times(1);
        });

        it('should throw on update error', async function() {
            const authorizationId = '843b5030-ee31-40f2-b9e0-d1d89cb70760';
            const granter = '0x14bB2bB081b6B604394b41fF23Eb023A295dFa04';
            const grantee = '0x98AD263a95F1ab1AbFF41F4D44b07c3240251A0a';

            const job = {
                data: {
                    authorizationId,
                    granter,
                    grantee,
                },
            } as Job<WithdrawTransactionConfirmed>;

            when(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: authorizationId,
                        granter,
                        grantee,
                        mode: 'withdraw',
                    }),
                    deepEqual({
                        cancelled: true,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(context.withdrawTasks.onWithdrawTransactionFailure(job)).rejects.toMatchObject(
                new NestError('Unable to set authorization to cancelled'),
            );

            verify(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: authorizationId,
                        granter,
                        grantee,
                        mode: 'withdraw',
                    }),
                    deepEqual({
                        cancelled: true,
                    }),
                ),
            ).times(1);
        });
    });
});
