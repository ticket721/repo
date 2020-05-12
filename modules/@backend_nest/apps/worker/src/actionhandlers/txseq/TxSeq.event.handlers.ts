import { ActionSetsService, Progress } from '@lib/common/actionsets/ActionSets.service';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet.class';
import { Injectable, OnModuleInit } from '@nestjs/common';
import Joi from '@hapi/joi';
import { ChecksRunnerUtil } from '@lib/common/actionsets/helper/ChecksRunner.util';
import { TransactionParameters } from '@common/global';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { TxsService } from '@lib/common/txs/Txs.service';
import { TxEntity } from '@lib/common/txs/entities/Tx.entity';
import {
    TransactionLifecycles,
    TransactionLifecycleTaskArgumentsChecker,
} from '@lib/common/txs/acset_builders/TxSequence.acsetbuilder.helper';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

/**
 * Data model required for the TxSeq Progress step
 */
export interface TxSeqTxHandler {
    /**
     * Transaction arguments
     */
    transaction: TransactionParameters & TransactionLifecycles;
    /**
     * Flag to know if transaction has already been broadcasted
     */
    broadcasted?: boolean;
    /**
     * Hash of the transaction to broadcast
     */
    transactionHash?: string;
}

/**
 * Class containing all event handlers of the TxSeq action set
 */
@Injectable()
export class TxSeqEventHandlers implements OnModuleInit {
    /**
     * Dependency Injection
     *
     * @param actionSetsService
     * @param txsService
     * @param txQueue
     */
    constructor(
        private readonly actionSetsService: ActionSetsService,
        private readonly txsService: TxsService,
        @InjectQueue('tx') private readonly txQueue: Queue,
    ) {}

    /**
     * Data Validator for the TxSeq Progress step
     */
    txHandlerValidator = Joi.object<TxSeqTxHandler>({
        transaction: Joi.object({
            from: Joi.string().required(),
            to: Joi.string().required(),
            value: Joi.string().required(),
            data: Joi.string().required(),
            onConfirm: TransactionLifecycleTaskArgumentsChecker.optional(),
            onFailure: TransactionLifecycleTaskArgumentsChecker.optional(),
        }),
        broadcasted: Joi.boolean(),
        transactionHash: Joi.string(),
    });

    /**
     * Data Fields for the TxSeq Progress step
     */
    txHandlerFields = ['transaction'];

    /**
     * Internal utility to broadcast the transaction using the tx service
     *
     * @param transaction
     */
    private async broadcastTransaction(transaction: TransactionParameters): Promise<ServiceResponse<TxEntity>> {
        return this.txsService.sendRawTransaction(
            transaction.from,
            transaction.to,
            transaction.value,
            transaction.data,
        );
    }

    /**
     * Event Handler of the Transaction Step
     *
     * @param checkoutResolveFields
     * @param actionset
     * @param progress
     */
    async txHandlerHandler(
        checkoutResolveFields: string[],
        actionset: ActionSet,
        progress: Progress,
    ): Promise<[ActionSet, boolean]> {
        const data: TxSeqTxHandler = actionset.action.data;

        const { error, error_trace } = ChecksRunnerUtil<TxSeqTxHandler>(
            data,
            this.txHandlerValidator,
            checkoutResolveFields,
        );

        switch (error) {
            case 'error': {
                actionset.action.setError({
                    details: error_trace,
                    error: 'validation_error',
                });
                actionset.action.setStatus('error');
                actionset.setStatus('event:error');
                break;
            }

            /* istanbul ignore next */
            case 'incomplete': {
                actionset.action.setIncomplete({
                    details: error_trace,
                    error: 'incomplete_error',
                });
                actionset.action.setStatus('incomplete');
                actionset.setStatus('event:incomplete');
                break;
            }

            case undefined: {
                if (!data.broadcasted) {
                    const broadcastResponse = await this.broadcastTransaction(data.transaction);

                    actionset.action.setData({
                        ...actionset.action.data,
                        broadcasted: true,
                    });

                    if (broadcastResponse.error) {
                        console.log('broadcasting error', broadcastResponse.error);

                        actionset.action.setError({
                            details: null,
                            error: broadcastResponse.error,
                        });
                        actionset.action.setStatus('error');
                        actionset.setStatus('event:error');
                        break;
                    }

                    actionset.action.setData({
                        ...actionset.action.data,
                        transactionHash: broadcastResponse.response.transaction_hash,
                    });
                } else {
                    const transactionSearchRes = await this.txsService.search({
                        transaction_hash: data.transactionHash,
                    });

                    if (transactionSearchRes.error) {
                        actionset.action.setError({
                            details: null,
                            error: transactionSearchRes.error,
                        });
                        actionset.action.setStatus('error');
                        actionset.setStatus('event:error');

                        if (data.transaction.onFailure) {
                            await this.txQueue.add(data.transaction.onFailure.name, {
                                transactionHash: data.transactionHash,
                                ...data.transaction.onFailure.jobData,
                            });
                        }

                        break;
                    }

                    const tx: TxEntity = transactionSearchRes.response[0];

                    if (tx.confirmed) {
                        if (tx.status === false) {
                            actionset.action.setError({
                                details: null,
                                error: 'transaction_failed',
                            });
                            actionset.action.setStatus('error');
                            actionset.setStatus('event:error');
                        } else {
                            if (data.transaction.onConfirm) {
                                await this.txQueue.add(data.transaction.onConfirm.name, {
                                    transactionHash: data.transactionHash,
                                    ...data.transaction.onConfirm.jobData,
                                });
                            }

                            actionset.next();
                        }

                        break;
                    }
                }
            }
        }

        await progress(100);
        return [actionset, true];
    }

    /**
     * Lifecycle callback to register all input handlers
     */
    /* istanbul ignore next */
    onModuleInit(): void {
        this.actionSetsService.setEventHandler(
            '@txseq/txhandler',
            this.txHandlerHandler.bind(this, this.txHandlerFields),
        );
    }
}
