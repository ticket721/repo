import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectSchedule, Schedule } from 'nest-schedule';
import { InstanceSignature, OutrospectionService } from '@lib/common/outrospection/Outrospection.service';
import {
    CircuitContainerBase,
    GemInitializationJob,
    GemRunJob,
} from '@app/worker/dosojinrunner/circuits/CircuitContainer.base';
import { GemOrdersService } from '@lib/common/gemorders/GemOrders.service';
import { InjectQueue } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { ESSearchHit } from '@lib/common/utils/ESSearchReturn.type';
import { GemOrderEntity } from '@lib/common/gemorders/entities/GemOrder.entity';
import { Gem } from 'dosojin';
import { NestError } from '@lib/common/utils/NestError';

/**
 * Service Handling all background Gem Resolutions
 */
@Injectable()
export class DosojinRunnerScheduler implements OnApplicationBootstrap {
    /**
     * Dependency Injection
     *
     * @param schedule
     * @param outrospectionService
     * @param gemOrdersService
     * @param dosojinQueue
     * @param shutdownService
     */
    constructor(
        @InjectSchedule() private readonly schedule: Schedule,
        private readonly outrospectionService: OutrospectionService,
        private readonly gemOrdersService: GemOrdersService,
        @InjectQueue('dosojin') private readonly dosojinQueue: Queue,
        private readonly shutdownService: ShutdownService,
    ) {}

    /**
     * Statically registered circuits
     */
    public static readonly circuits: CircuitContainerBase[] = [];

    /**
     * Static Registration method
     *
     * @param circuit
     */
    public static register(circuit: CircuitContainerBase): void {
        DosojinRunnerScheduler.circuits.push(circuit);
    }

    // This is an advanced distribution query
    /*
            body: {
                query: {
                    bool: {
                        must_not: {
                            exists: {
                                field: 'gem',
                            },
                        },
                        filter: {
                            script: {
                                script: {
                                    source: `
                                        if (!doc.containsKey('gem') || !doc.containsKey('gem.refreshTimer')) {
                                            if (Math.abs(System.currentTimeMillis() - doc['updated_at'].date.getMillis()) < params.defaultTimer) {
                                                return false;
                                            }
                                        } else {
                                            if (Math.abs(System.currentTimeMillis() - doc['updated_at'].date.getMillis()) < doc['gem.refreshTimer']) {
                                                return false;
                                            }
                                        }
                                        return (doc['id'].value % params.total == params.position);
                                    `,
                                    lang: 'painless',
                                    params: {
                                        position,
                                        total,
                                        defaultTimer: 5000,
                                    }
                                }
                            }
                        }
                    }
                }
            },
     */

    /**
     * Poller to periodically fetch gems that should be running, and dispatch them into bull
     */
    public async gemRunnerPoller(): Promise<void> {
        const esQuery = {
            body: {
                query: {
                    bool: {
                        must: [
                            {
                                term: {
                                    initialized: true,
                                },
                            },
                            {
                                nested: {
                                    path: 'gem',
                                    query: {
                                        bool: {
                                            must: {
                                                term: {
                                                    'gem.gem_status': 'Running',
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                        filter: {
                            script: {
                                script: {
                                    source: `
                                            if (doc.containsKey('refresh_timer') && !doc['refresh_timer'].empty) {
                                                if (Math.abs(System.currentTimeMillis() - doc['updated_at'].date.getMillis()) < doc['refresh_timer'].value) {
                                                    return false;
                                                }
                                            } else {
                                                if (Math.abs(System.currentTimeMillis() - doc['updated_at'].date.getMillis()) < params.defaultTimer) {
                                                    return false;
                                                }
                                            }
                                            return true;
                                    `,
                                    lang: 'painless',
                                    params: {
                                        defaultTimer: 1000,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        };

        const gemsToDispatchRes = await this.gemOrdersService.searchElastic(esQuery);

        if (gemsToDispatchRes.error) {
            return this.shutdownService.shutdownWithError(
                new NestError(`Error while recovering gems to dispatch: ${gemsToDispatchRes.error}`),
            );
        }

        if (gemsToDispatchRes.response.hits.total === 0) {
            return;
        }

        const jobs = await this.dosojinQueue.getJobs(['waiting', 'active']);

        const orders: GemOrderEntity[] = gemsToDispatchRes.response.hits.hits.map(
            (hit: ESSearchHit<GemOrderEntity>): GemOrderEntity => hit._source,
        );

        for (const order of orders) {
            if (jobs.findIndex((job: Job<GemRunJob>): boolean => job.data.orderId === order.id) !== -1) {
                continue;
            }

            await this.dosojinQueue.add(`@@dosojin/${order.circuit_name}/run`, {
                orderId: order.id,
            });
        }
    }

    /**
     * Poller to periodically fetch uninitialized gems and dispatch them into bull
     */
    public async gemInitializerPoller(): Promise<void> {
        const esQuery = {
            body: {
                query: {
                    bool: {
                        must: {
                            term: {
                                initialized: false,
                            },
                        },
                    },
                },
            },
        };

        const uninitializedGemOrdersRes = await this.gemOrdersService.searchElastic(esQuery);

        if (uninitializedGemOrdersRes.error) {
            return this.shutdownService.shutdownWithError(
                new NestError(`Unable to fetch gem orders for initialization: ${uninitializedGemOrdersRes.error}`),
            );
        }

        if (uninitializedGemOrdersRes.response.hits.total > 0) {
            const jobs = await this.dosojinQueue.getJobs(['active', 'waiting']);

            const orders = uninitializedGemOrdersRes.response.hits.hits.map(
                (hit: ESSearchHit<GemOrderEntity>): GemOrderEntity => hit._source,
            );

            for (const order of orders) {
                if (
                    jobs.findIndex((job: Job<GemInitializationJob<any>>): boolean => job.data.orderId === order.id) !==
                    -1
                ) {
                    continue;
                }

                if (
                    DosojinRunnerScheduler.circuits.findIndex(
                        (circuit: CircuitContainerBase): boolean => circuit.name === order.circuit_name,
                    ) === -1
                ) {
                    const rawGem = new Gem().setGemStatus('Fatal').raw;

                    rawGem.error_info = {
                        dosojin: null,
                        layer: null,
                        entity_name: null,
                        entity_type: null,
                        message: `Unknown circuit ${order.circuit_name}`,
                    };

                    const errorUpdateRes = await this.gemOrdersService.update(
                        {
                            id: order.id,
                        },
                        {
                            gem: GemOrderEntity.fromDosojinRaw(rawGem),
                        },
                    );

                    if (errorUpdateRes.error) {
                        return this.shutdownService.shutdownWithError(
                            new NestError(`Unable to signal gem initialization error: ${errorUpdateRes.error}`),
                        );
                    }
                } else {
                    await this.dosojinQueue.add(`@@dosojin/${order.circuit_name}/initialization`, {
                        orderId: order.id,
                        args: order.initial_arguments ? JSON.parse(order.initial_arguments) : null,
                    });
                }
            }
        }
    }

    /**
     * Application Startup Method
     */
    async onApplicationBootstrap(): Promise<void> {
        const signature: InstanceSignature = await this.outrospectionService.getInstanceSignature();

        if (signature.name === 'worker' && signature.master) {
            this.schedule.scheduleIntervalJob('gemInitializerPoller', 100, this.gemInitializerPoller.bind(this));
            this.schedule.scheduleIntervalJob('gemRunnerPoller', 100, this.gemRunnerPoller.bind(this));
        }
    }
}
