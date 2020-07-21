import { Inject, OnModuleDestroy, OnModuleInit }       from '@nestjs/common';
import { InjectSchedule, Schedule }                    from 'nest-schedule';
import { TxsService, TxsServiceOptions }               from '@lib/common/txs/Txs.service';
import { GlobalConfigService }                         from '@lib/common/globalconfig/GlobalConfig.service';
import { ESSearchBodyBuilder }                         from '@lib/common/utils/ESSearchBodyBuilder.helper';
import { SortablePagedSearch }                         from '@lib/common/utils/SortablePagedSearch.type';
import { fromES }                                      from '@lib/common/utils/fromES.helper';
import { Log, TxEntity }                               from '@lib/common/txs/entities/Tx.entity';
import { Web3Service }                                 from '@lib/common/web3/Web3.service';
import { toAcceptedAddressFormat, log2, isTrackingId } from '@common/global';
import { WinstonLoggerService }                        from '@lib/common/logger/WinstonLogger.service';
import { ShutdownService }                             from '@lib/common/shutdown/Shutdown.service';
import { OutrospectionService }                        from '@lib/common/outrospection/Outrospection.service';
import { NestError }                                   from '@lib/common/utils/NestError';
import { RocksideService }                             from '@lib/common/rockside/Rockside.service';

/**
 * Txs task scheduler
 */
export class TxsScheduler implements OnModuleInit, OnModuleDestroy {
    /**
     * Dependency Injection
     *
     * @param globalConfigService
     * @param web3Service
     * @param txsService
     * @param loggerService
     * @param shutdownService
     * @param schedule
     * @param txsOptions
     * @param outrospectionService
     * @param rocksideService
     */
    constructor(
        private readonly globalConfigService: GlobalConfigService,
        private readonly web3Service: Web3Service,
        private readonly txsService: TxsService,
        private readonly loggerService: WinstonLoggerService,
        private readonly shutdownService: ShutdownService,
        @InjectSchedule() private readonly schedule: Schedule,
        @Inject('TXS_MODULE_OPTIONS')
        private readonly txsOptions: TxsServiceOptions,
        private readonly outrospectionService: OutrospectionService,
        private readonly rocksideService: RocksideService,
    ) {
    }

    /**
     * Last fetched block number
     */
    private lastBlock: number = null;

    /**
     * Check if new block exists to validate transactions
     */
    async blockPolling(): Promise<void> {
        const currentGlobalConfig = await this.globalConfigService.search({
            id: 'global',
        });

        if (currentGlobalConfig.error || currentGlobalConfig.response.length === 0) {
            return this.shutdownService.shutdownWithError(
                new NestError('TxsScheduler::blockPolling unable to recover global config'),
            );
        }

        const globalConfig = currentGlobalConfig.response[0];

        if (this.lastBlock === null || globalConfig.block_number > this.lastBlock) {
            const bodyBuilder = ESSearchBodyBuilder({
                confirmed: {
                    $eq: false,
                },
                block_number: {
                    $gt: 0,
                    $lte: globalConfig.block_number - this.txsOptions.blockThreshold,
                },
            } as SortablePagedSearch);

            const pendingTransactions = await this.txsService.searchElastic(bodyBuilder.response);

            if (pendingTransactions.error) {
                return this.shutdownService.shutdownWithError(
                    new NestError('TxsScheduler::blockPolling error while fetching txs'),
                );
            }

            if (pendingTransactions.response.hits.total > 0) {
                for (const hit of pendingTransactions.response.hits.hits) {
                    const parsed = fromES<TxEntity>(hit);

                    const updateStatus = await this.txsService.update(
                        {
                            transaction_hash: parsed.transaction_hash,
                        },
                        {
                            confirmed: true,
                        },
                    );

                    if (updateStatus.error) {
                        return this.shutdownService.shutdownWithError(
                            new NestError(`TxsScheduler::blockPolling error while updating tx: ${updateStatus.error}`),
                        );
                    }

                    this.loggerService.log(`Confirmed Transaction ${parsed.transaction_hash}`);

                }
            }
        }
    }

    /**
     * Task to initialize transaction
     */
    async transactionInitialization(): Promise<void> {
        const currentGlobalConfig = await this.globalConfigService.search({
            id: 'global',
        });

        if (currentGlobalConfig.error || currentGlobalConfig.response.length === 0) {
            return this.shutdownService.shutdownWithError(
                new NestError('TxsScheduler::transactionInitialization unable to recover global config'),
            );
        }

        const globalConfig = currentGlobalConfig.response[0];

        const bodyBuilder = ESSearchBodyBuilder({
            confirmed: {
                $eq: false,
            },
            block_number: {
                $eq: 0,
            },
        } as SortablePagedSearch);

        const pendingTransactions = await this.txsService.searchElastic(bodyBuilder.response);

        if (pendingTransactions.error) {
            return this.shutdownService.shutdownWithError(
                new NestError(
                    `TxsScheduler::transactionInitialization error while fetching txs: ${pendingTransactions.error}`,
                ),
            );
        }

        if (pendingTransactions.response.hits.total > 0) {
            const web3 = await this.web3Service.get();

            for (const hit of pendingTransactions.response.hits.hits) {
                const parsed = fromES<TxEntity>(hit);

                if (isTrackingId(parsed.transaction_hash)) {

                    const txInfos = await this.rocksideService.getTransactionInfos(parsed.transaction_hash);

                    if (txInfos.error) {
                        this.loggerService.error(txInfos.error);
                        continue;
                    }

                    const txReceipt = txInfos.response.receipt;

                    if (txReceipt === null) {
                        continue;
                    }

                    parsed.status = !!txReceipt.status;
                    parsed.block_number = txReceipt.block_number;
                    parsed.block_hash = txReceipt.block_hash.toLowerCase();
                    parsed.contract_address = txReceipt.contract_address
                        ? toAcceptedAddressFormat(txReceipt.contract_address)
                        : null;
                    parsed.cumulative_gas_used = txReceipt.gas_used.toString();
                    parsed.cumulative_gas_used_ln = log2(txReceipt.gas_used.toString());
                    parsed.gas_used = txReceipt.gas_used.toString();
                    parsed.gas_used_ln = log2(txReceipt.gas_used.toString());
                    parsed.gas_price = txInfos.response.gas_price.toString();
                    parsed.gas_price_ln = log2(txInfos.response.gas_price.toString());
                    parsed.from_ = txInfos.response.from;
                    parsed.to_ = txInfos.response.to;
                    parsed.transaction_index = txReceipt.transaction_index;
                    parsed.logs_bloom = null;
                    parsed.logs = txReceipt.logs.map(
                        (log: any): Log => ({
                            address: toAcceptedAddressFormat(log.address),
                            block_hash: log.blockHash.toLowerCase(),
                            block_number: log.blockNumber,
                            data: log.data.toLowerCase(),
                            log_index: log.logIndex,
                            removed: log.removed || false,
                            topics: log.topics.map((topic: string): string => topic.toLowerCase()),
                            transaction_hash: log.transactionHash.toLowerCase(),
                            transaction_index: log.transactionIndex,
                            id: log.id,
                        }),
                    );
                    parsed.real_transaction_hash = txInfos.response.transaction_hash;

                    if (globalConfig.block_number - txReceipt.block_number >= this.txsOptions.blockThreshold) {
                        parsed.confirmed = true;
                    }

                } else {

                    const txReceipt = await web3.eth.getTransactionReceipt(parsed.transaction_hash);

                    const txInfos = await web3.eth.getTransaction(parsed.transaction_hash);

                    if (txReceipt === null || txInfos === null) {
                        continue;
                    }

                    parsed.status = !!txReceipt.status;
                    parsed.block_number = txReceipt.blockNumber;
                    parsed.block_hash = txReceipt.blockHash.toLowerCase();
                    parsed.contract_address = txReceipt.contractAddress
                        ? toAcceptedAddressFormat(txReceipt.contractAddress)
                        : null;
                    parsed.cumulative_gas_used = txReceipt.cumulativeGasUsed.toString();
                    parsed.cumulative_gas_used_ln = log2(txReceipt.cumulativeGasUsed);
                    parsed.gas_used = txReceipt.gasUsed.toString();
                    parsed.gas_used_ln = log2(txReceipt.gasUsed);
                    parsed.gas_price = txInfos.gasPrice.toString();
                    parsed.gas_price_ln = log2(txInfos.gasPrice);
                    parsed.from_ = txReceipt.from;
                    parsed.to_ = txReceipt.to;
                    parsed.transaction_index = txReceipt.transactionIndex;
                    parsed.logs_bloom = txReceipt.logsBloom.toLowerCase();
                    parsed.logs = txReceipt.logs.map(
                        (log: any): Log => ({
                            address: toAcceptedAddressFormat(log.address),
                            block_hash: log.blockHash.toLowerCase(),
                            block_number: log.blockNumber,
                            data: log.data.toLowerCase(),
                            log_index: log.logIndex,
                            removed: log.removed || false,
                            topics: log.topics.map((topic: string): string => topic.toLowerCase()),
                            transaction_hash: log.transactionHash.toLowerCase(),
                            transaction_index: log.transactionIndex,
                            id: log.id,
                        }),
                    );

                    if (globalConfig.block_number - txReceipt.blockNumber >= this.txsOptions.blockThreshold) {
                        parsed.confirmed = true;
                    }

                }

                const thash = parsed.transaction_hash;

                delete parsed.transaction_hash;

                const updateStatus = await this.txsService.update(
                    {
                        transaction_hash: thash,
                    },
                    parsed,
                );

                if (updateStatus.error) {
                    return this.shutdownService.shutdownWithError(
                        new NestError(
                            `TxsScheduler::transactionInitialization error while updating tx: ${updateStatus.error}`,
                        ),
                    );
                }

                if (parsed.confirmed) {
                    this.loggerService.log(`Initialized & Confirmed Transaction ${thash}`);
                } else {
                    this.loggerService.log(`Initialized Transaction ${thash}`);
                }
            }
        }
    }

    /**
     * Interval Starter
     */

    /* istanbul ignore next */
    async onModuleInit(): Promise<void> {
        const signature = await this.outrospectionService.getInstanceSignature();

        if (signature.master === true && signature.name === 'worker') {
            this.schedule.scheduleIntervalJob(
                'blockPolling',
                this.txsOptions.blockPollingRefreshRate,
                this.blockPolling.bind(this),
            );
            this.schedule.scheduleIntervalJob(
                'transactionInitialization',
                this.txsOptions.blockPollingRefreshRate,
                this.transactionInitialization.bind(this),
            );
        }
    }

    /**
     * Interval Stopper
     */

    /* istanbul ignore next */
    async onModuleDestroy(): Promise<void> {
        const signature = await this.outrospectionService.getInstanceSignature();

        if (signature.master === true && signature.name === 'worker') {
            this.schedule.cancelJobs();
        }
    }
}
