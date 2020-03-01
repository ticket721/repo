import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import {
    InstanceSignature,
    OutrospectionService,
} from '@lib/common/outrospection/Outrospection.service';
import { InjectSchedule, Schedule } from 'nest-schedule';
import { EVMEventControllerBase } from '@app/worker/evmantenna/EVMEvent.controller.base';
import { GlobalConfigService } from '@lib/common/globalconfig/GlobalConfig.service';
import { EVMEventSetsService } from '@lib/common/evmeventsets/EVMEventSets.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { GlobalEntity } from '@lib/common/globalconfig/entities/Global.entity';
import { Job, Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { ESSearchHit } from '@lib/common/utils/ESSearchReturn';
import {
    EVMEvent,
    EVMEventSetEntity,
} from '@lib/common/evmeventsets/entities/EVMEventSet.entity';
import { DryResponse } from '@lib/common/crud/CRUD.extension';
import { Connection, InjectConnection } from '@iaminfinity/express-cassandra';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';
import { EVMBlockRollbacksService } from '@lib/common/evmblockrollbacks/EVMBlockRollbacks.service';
import { cassandraArrayResult } from '@lib/common/utils/cassandraArrayResult';

/**
 * Data Model contained inside the merge jobs
 */
export interface EVMAntennaMergerJob {
    /**
     * Block Number to merge
     */
    blockNumber: number;
}

/**
 * Extended Data Model to easily recover the controller to process a specific event
 */
export interface EVMProcessableEvent extends EVMEvent {
    /**
     * Name of the artifact that generated this event
     */
    artifact_name: string;
}

/**
 * Scheduler class containing background logics to fetch events, merge and apply changes accross the cluster
 */
@Injectable()
export class EVMAntennaMergerScheduler implements OnApplicationBootstrap {
    /**
     * Logger
     */
    private readonly logger: WinstonLoggerService = new WinstonLoggerService(
        'EVMAntennaMerger',
    );

    /**
     * Dependency Injection
     *
     * @param outrospectionService
     * @param schedule
     * @param globalConfigService
     * @param evmEventSetsService
     * @param evmBlockRollbacksService
     * @param shutdownService
     * @param queue
     * @param connection
     */
    constructor(
        private readonly outrospectionService: OutrospectionService,
        @InjectSchedule() private readonly schedule: Schedule,
        private readonly globalConfigService: GlobalConfigService,
        private readonly evmEventSetsService: EVMEventSetsService,
        private readonly evmBlockRollbacksService: EVMBlockRollbacksService,
        private readonly shutdownService: ShutdownService,
        @InjectQueue('evmantenna')
        private readonly queue: Queue<EVMAntennaMergerJob>,
        @InjectConnection() private readonly connection: Connection,
    ) {}

    /**
     * Static Controllers that are subscribing to this merger
     */
    private static readonly controllers: EVMEventControllerBase[] = [];

    /**
     * Static method called by a controller to register itself
     * @param controller
     */
    static registerEVMEventsController(
        controller: EVMEventControllerBase,
    ): void {
        EVMAntennaMergerScheduler.controllers.push(controller);
    }

    /**
     * Polling function to verify if a merging is possible
     */
    async evmEventMergerPoller(): Promise<void> {
        const globalConfigRes = await this.globalConfigService.search({
            id: 'global',
        });

        if (globalConfigRes.error || globalConfigRes.response.length === 0) {
            const error = new Error(
                `EVMAntennaMergerScheduler::evmEventMergerPoller | Unable to recover global config: ${globalConfigRes.error ||
                    'no document found'}`,
            );
            this.shutdownService.shutdownWithError(error);
            throw error;
        }

        const globalConfig: GlobalEntity = globalConfigRes.response[0];

        const processedHeight = globalConfig.processed_block_number;
        const currentHeight = globalConfig.block_number;

        if (processedHeight === currentHeight) {
            return;
        }

        const toProcess = processedHeight + 1;

        const currentJob = (
            await this.queue.getJobs(['waiting', 'active'])
        ).filter(
            (job: Job): boolean => job.name === `@@evmeventset/evmEventMerger`,
        );

        if (currentJob.length === 0) {
            await this.queue.add(`@@evmeventset/evmEventMerger`, {
                blockNumber: toProcess,
            });
        }
    }

    /**
     * Utility to bind and use to build the forward and rollback batched queries
     *
     * @param querries
     * @param rollbacks
     * @param query
     * @param rollback
     */
    appender(
        querries: DryResponse[],
        rollbacks: DryResponse[],
        query: DryResponse,
        rollback: DryResponse,
    ): void {
        if (!query || !rollback) {
            throw new Error(
                `Cannot have asymmetric updates: each query must have its rollback !`,
            );
        }

        querries.push(query);
        rollbacks.unshift(rollback);
    }

    /**
     * Internal utility to fetch all evm event sets for a specific block
     *
     * @param blockNumber
     */
    private async fetchEvmEventSets(
        blockNumber: number,
    ): Promise<ESSearchHit<EVMEventSetEntity>[]> {
        const esQuery = {
            body: {
                query: {
                    bool: {
                        must: {
                            term: {
                                block_number: blockNumber,
                            },
                        },
                    },
                },
            },
        };

        const EVMEventSets = await this.evmEventSetsService.searchElastic(
            esQuery,
        );

        if (EVMEventSets.error) {
            throw new Error(
                `EVMAntennaMergerScheduler::fetchEvmEventSets | Error while fetching events for block ${blockNumber}: ${EVMEventSets.error}`,
            );
        }

        if (
            EVMEventSets.response.hits.total !==
            EVMAntennaMergerScheduler.controllers.length
        ) {
            return null;
        }

        return EVMEventSets.response.hits.hits;
    }

    /**
     * Internal utility to sort and merge evm event sets by transaction / log order
     *
     * @param esres
     */
    private sortAndMergeEvents(
        esres: ESSearchHit<EVMEventSetEntity>[],
    ): EVMProcessableEvent[] {
        return []
            .concat(
                ...esres.map(
                    (
                        eshit: ESSearchHit<EVMEventSetEntity>,
                    ): EVMProcessableEvent[] =>
                        cassandraArrayResult(eshit._source.events).map(
                            (esraw: EVMEvent): EVMProcessableEvent => ({
                                ...esraw,
                                artifact_name: eshit._source.artifact_name,
                            }),
                        ),
                ),
            )
            .sort(
                (
                    rawEventA: EVMProcessableEvent,
                    rawEventB: EVMProcessableEvent,
                ): number => {
                    if (
                        rawEventA.transaction_index !==
                        rawEventB.transaction_index
                    ) {
                        return (
                            rawEventA.transaction_index -
                            rawEventB.transaction_index
                        );
                    }

                    return rawEventA.log_index - rawEventB.log_index;
                },
            );
    }

    /**
     * Internal utility to convert raw evm events to queries + rollbacks
     *
     * @param queries
     * @param rollbacks
     * @param events
     */
    private async convertEventsToQueries(
        queries: DryResponse[],
        rollbacks: DryResponse[],
        events: EVMProcessableEvent[],
    ): Promise<void> {
        for (const event of events) {
            const controllerIdx = EVMAntennaMergerScheduler.controllers.findIndex(
                (controller: EVMEventControllerBase): boolean =>
                    controller.isHandler(event.event, event.artifact_name),
            );

            if (controllerIdx === -1) {
                throw new Error(
                    `EVMAntennaMergerScheduler::convertEventsToQueries | event ${event.event} from ${event.artifact_name} has no matching controller`,
                );
            }

            await EVMAntennaMergerScheduler.controllers[controllerIdx].convert(
                event,
                this.appender.bind(null, queries, rollbacks),
            );
        }
    }

    /**
     * Internal utility to add the query used to delete all evm event sets for currently processed block
     *
     * @param queries
     * @param blockNumber
     */
    private async injectEventSetDeletionQueries(
        queries: DryResponse[],
        blockNumber: number,
    ): Promise<void> {
        for (const controller of EVMAntennaMergerScheduler.controllers) {
            const evmEventSetsRemoval = await this.evmEventSetsService.dryDelete(
                {
                    artifact_name: controller.artifactName,
                    event_name: controller.eventName,
                    block_number: blockNumber,
                },
            );

            if (evmEventSetsRemoval.error) {
                throw new Error(
                    `EVMAntennaMergerScheduler::injectEventSetDeletionQueries | error while creating evmeventset removal on event ${controller.eventName} on controller ${controller.artifactName}`,
                );
            }

            queries.push(evmEventSetsRemoval.response);
        }
    }

    /**
     * Internal utility to add the query used to increment the processed block number
     *
     * @param queries
     * @param blockNumber
     */
    private async injectProcessedHeightUpdateQuery(
        queries: DryResponse[],
        blockNumber: number,
    ): Promise<void> {
        const globalConfigRes = await this.globalConfigService.dryUpdate(
            {
                id: 'global',
            },
            {
                processed_block_number: blockNumber,
            },
        );

        if (globalConfigRes.error) {
            throw new Error(
                `EVMAntennaMergerScheduler::evmEventMerger | error while creating global config update query: ${globalConfigRes.error}`,
            );
        }

        queries.push(globalConfigRes.response);
    }

    /**
     * Internal utility to store emergency rollback queries into the database
     *
     * @param queries
     * @param rollbacks
     * @param blockNumber
     */
    private async injectBlockRollbackCreationQuery(
        queries: DryResponse[],
        rollbacks: DryResponse[],
        blockNumber: number,
    ): Promise<void> {
        const rollbackRes = await this.evmBlockRollbacksService.dryCreate({
            block_number: blockNumber,
            rollback_queries: rollbacks,
        });

        if (rollbackRes.error) {
            throw new Error(
                `EVMAntennaMergerScheduler::injectBlockRollbackCreationQuery | error while creating block rollback query: ${rollbackRes.error}`,
            );
        }

        rollbackRes.response.params[1] = rollbackRes.response.params[1].map(
            (elem: DryResponse): DryResponse => {
                return {
                    query: elem.query,
                    params: elem.params.map((param: any): string => {
                        switch (typeof param) {
                            case 'string':
                                return param;
                            case 'number':
                                return param.toString();
                            default:
                                return JSON.stringify(param);
                        }
                    }),
                };
            },
        );

        queries.push(rollbackRes.response);
    }

    /**
     * Bull Task to merge a specific job
     *
     * @param job
     */
    async evmEventMerger(job: Job<EVMAntennaMergerJob>): Promise<void> {
        const esQueryResult = await this.fetchEvmEventSets(
            job.data.blockNumber,
        );

        if (esQueryResult === null) {
            return;
        }

        const rawEvents = this.sortAndMergeEvents(esQueryResult);

        const queryBatch: DryResponse[] = [];
        const rollbackBatch: DryResponse[] = [];

        await this.convertEventsToQueries(queryBatch, rollbackBatch, rawEvents);
        await this.injectEventSetDeletionQueries(
            queryBatch,
            job.data.blockNumber,
        );
        await this.injectProcessedHeightUpdateQuery(
            queryBatch,
            job.data.blockNumber,
        );
        await this.injectBlockRollbackCreationQuery(
            queryBatch,
            rollbackBatch,
            job.data.blockNumber,
        );

        try {
            await this.connection.doBatchAsync((queryBatch as any) as string[]);
        } catch (e) {
            this.logger.error(
                `Error when broadcasting event fusion batched transaction for block ${job.data.blockNumber}`,
            );
            this.logger.error(e);
            throw e;
        }

        this.logger.log(
            `Successful block ${job.data.blockNumber} event fusion`,
        );
    }

    /**
     * Called after all controllers registration
     */
    async onApplicationBootstrap(): Promise<void> {
        const signature: InstanceSignature = await this.outrospectionService.getInstanceSignature();

        if (signature.master === true && signature.name === 'worker') {
            this.schedule.scheduleIntervalJob(
                'evmEventMerger',
                100,
                this.evmEventMergerPoller.bind(this),
            );
        }

        if (signature.name === 'worker') {
            this.queue
                .process(
                    `@@evmeventset/evmEventMerger`,
                    1,
                    this.evmEventMerger.bind(this),
                )
                .then(() =>
                    console.log(
                        `Closing Bull Queue @@evmeventset/evmEventMerger`,
                    ),
                )
                .catch(this.shutdownService.shutdownWithError);
        }
    }
}
