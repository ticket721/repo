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
     * Bull Task to merge a specific job
     *
     * @param job
     */
    async evmEventMerger(job: Job<EVMAntennaMergerJob>): Promise<void> {
        const esQuery = {
            body: {
                query: {
                    bool: {
                        must: {
                            term: {
                                block_number: job.data.blockNumber,
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
                `EVMAntennaMergerScheduler::evmEventMerger | Error while fetching events for block ${job.data.blockNumber}: ${EVMEventSets.error}`,
            );
        }

        if (
            EVMEventSets.response.hits.total !==
            EVMAntennaMergerScheduler.controllers.length
        ) {
            return;
        }

        const rawEvents: EVMProcessableEvent[] = []
            .concat(
                ...EVMEventSets.response.hits.hits.map(
                    (
                        eshit: ESSearchHit<EVMEventSetEntity>,
                    ): EVMProcessableEvent[] =>
                        eshit._source.events
                            ? Array.isArray(eshit._source.events)
                                ? eshit._source.events.map(
                                      (
                                          esraw: EVMEvent,
                                      ): EVMProcessableEvent => ({
                                          ...esraw,
                                          artifact_name:
                                              eshit._source.artifact_name,
                                      }),
                                  )
                                : [
                                      {
                                          ...(eshit._source.events as EVMEvent),
                                          artifact_name:
                                              eshit._source.artifact_name,
                                      },
                                  ]
                            : [],
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

        const queryBatch: DryResponse[] = [];
        const rollbackBatch: DryResponse[] = [];

        for (const event of rawEvents) {
            const controllerIdx = EVMAntennaMergerScheduler.controllers.findIndex(
                (controller: EVMEventControllerBase): boolean =>
                    controller.isHandler(event.event, event.artifact_name),
            );

            if (controllerIdx === -1) {
                throw new Error(
                    `EVMAntennaMergerScheduler::evmEventMerger | event ${event.event} from ${event.artifact_name} has no matching controller`,
                );
            }

            await EVMAntennaMergerScheduler.controllers[controllerIdx].convert(
                event,
                this.appender.bind(null, queryBatch, rollbackBatch),
            );
        }

        for (const controller of EVMAntennaMergerScheduler.controllers) {
            const evmEventSetsRemoval = await this.evmEventSetsService.dryDelete(
                {
                    artifact_name: controller.artifactName,
                    event_name: controller.eventName,
                    block_number: job.data.blockNumber,
                },
            );

            if (evmEventSetsRemoval.error) {
                throw new Error(
                    `EVMAntennaMergerScheduler::evmEventMerger | error while creating evmeventset removal on event ${controller.eventName} on controller ${controller.artifactName}`,
                );
            }

            queryBatch.push(evmEventSetsRemoval.response);
        }

        const globalConfigRes = await this.globalConfigService.dryUpdate(
            {
                id: 'global',
            },
            {
                processed_block_number: job.data.blockNumber,
            },
        );

        if (globalConfigRes.error) {
            throw new Error(
                `EVMAntennaMergerScheduler::evmEventMerger | error while creating global config update query`,
            );
        }

        queryBatch.push(globalConfigRes.response);

        const rollbackRes = await this.evmBlockRollbacksService.dryCreate({
            block_number: job.data.blockNumber,
            rollback_queries: rollbackBatch,
        });

        if (rollbackRes.error) {
            throw new Error(
                `EVMAntennaMergerScheduler::evmEventMerger | error while creating block rollback query: ${rollbackRes.error}`,
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

        queryBatch.push(rollbackRes.response);

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
