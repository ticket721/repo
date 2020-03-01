import { Appender, EVMEventControllerBase } from '@app/worker/evmantenna/EVMEvent.controller.base';
import { GlobalConfigService } from '@lib/common/globalconfig/GlobalConfig.service';
import { InjectSchedule, Schedule } from 'nest-schedule';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { T721ControllerV0Service } from '@lib/common/contracts/t721controller/T721Controller.V0.service';
import { OutrospectionService } from '@lib/common/outrospection/Outrospection.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EVMEventSetsService } from '@lib/common/evmeventsets/EVMEventSets.service';
import { EVMProcessableEvent } from '@app/worker/evmantenna/EVMAntennaMerger.scheduler';
import { cloneDeep } from 'lodash';
import { EventsService } from '@lib/common/events/Events.service';
import { EventEntity } from '@lib/common/events/entities/Event.entity';
import { toB32 } from '@ticket721sources/global';
import { cassandraArrayResult } from '@lib/common/utils/cassandraArrayResult';
import { Category, DateEntity } from '@lib/common/dates/entities/Date.entity';
import { DatesService } from '@lib/common/dates/Dates.service';

/**
 * EVM Antenna to intercept NewCategory events emitted by the T721Controller
 */
export class NewCategoryT721CEVMAntenna extends EVMEventControllerBase {
    /**
     * Dependency Injection
     *
     * @param t721ControllerService
     * @param scheduler
     * @param queue
     * @param globalConfigService
     * @param shutdownService
     * @param outrospectionService
     * @param evmEventSetsService
     * @param eventsService
     * @param datesService
     */
    constructor(
        t721ControllerService: T721ControllerV0Service,
        @InjectSchedule() scheduler: Schedule,
        @InjectQueue('evmantenna') queue: Queue,
        globalConfigService: GlobalConfigService,
        shutdownService: ShutdownService,
        outrospectionService: OutrospectionService,
        evmEventSetsService: EVMEventSetsService,
        private readonly eventsService: EventsService,
        private readonly datesService: DatesService,
    ) {
        super(
            t721ControllerService,
            scheduler,
            queue,
            globalConfigService,
            shutdownService,
            outrospectionService,
            evmEventSetsService,
            'NewCategory',
        );
    }

    /**
     * Utility to recover high level group related entity
     *
     * @param groupId
     */
    private async fetchLinkedEntity(groupId: string): Promise<[string, any]> {
        const esQuery = {
            body: {
                query: {
                    bool: {
                        must: {
                            term: {
                                group_id: groupId.toLowerCase(),
                            },
                        },
                    },
                },
            },
        };

        const eventSearchRes = await this.eventsService.searchElastic(esQuery);

        if (eventSearchRes.error) {
            throw new Error(
                `NewCategoryT721CEVMAntenna::convert | error while fetching events: ${eventSearchRes.error}`,
            );
        }

        if (eventSearchRes.response.hits.total !== 0) {
            return ['event', eventSearchRes.response.hits.hits[0]._source];
        }

        return [null, null];
    }

    /**
     * Event Converter
     *
     * @param event
     * @param append
     */
    async convert(event: EVMProcessableEvent, append: Appender): Promise<any> {
        const data = JSON.parse(event.return_values);

        const linked = await this.fetchLinkedEntity(data.group_id);

        switch (linked[0]) {
            case null: {
                return;
            }

            case 'event': {
                const eventEntity: EventEntity = linked[1];

                const eventCategories = cassandraArrayResult<Category>(eventEntity.categories);

                for (const category of eventCategories) {
                    category.prices = cassandraArrayResult(category.prices);

                    if (toB32(category.category_name).toLowerCase() === data.category_name.toLowerCase()) {
                        const oldCategories = cloneDeep(eventCategories);

                        category.status = 'deployed';
                        category.group_id = data.group_id;

                        const updateQueryRes = await NewCategoryT721CEVMAntenna.rollbackableUpdate(
                            this.eventsService,
                            {
                                id: eventEntity.id,
                            },
                            {
                                categories: {
                                    old: oldCategories,
                                    new: eventCategories,
                                },
                            },
                            append,
                        );

                        if (updateQueryRes.error) {
                            throw new Error(
                                `NewCategoryT721CEVMAntenna::convert | error while generating dry event category update: ${updateQueryRes.error}`,
                            );
                        }

                        return;
                    }
                }

                const dateIds = eventEntity.dates;

                for (const dateId of dateIds) {
                    const dateFetchRes = await this.datesService.search({
                        id: dateId,
                    });

                    if (dateFetchRes.error) {
                        throw new Error(
                            `NewCategoryT721CEVMAntenna::convert | error while fetching dates: ${dateFetchRes.error}`,
                        );
                    }

                    const date: DateEntity = dateFetchRes.response[0];

                    const dateCategories: Category[] = cassandraArrayResult<Category>(date.categories);

                    for (const category of dateCategories) {
                        category.prices = cassandraArrayResult(category.prices);

                        if (toB32(category.category_name.toLowerCase()) === data.category_name.toLowerCase()) {
                            const oldCategories = cloneDeep(dateCategories);

                            category.status = 'deployed';
                            category.group_id = data.group_id;

                            const updateQueryRes = await NewCategoryT721CEVMAntenna.rollbackableUpdate(
                                this.datesService,
                                {
                                    id: date.id,
                                },
                                {
                                    categories: {
                                        new: dateCategories,
                                        old: oldCategories,
                                    },
                                },
                                append,
                            );

                            if (updateQueryRes.error) {
                                throw new Error(
                                    `NewCategoryT721CEVMAntenna::convert | error while generating dry date category update: ${updateQueryRes.error}`,
                                );
                            }

                            return;
                        }
                    }
                }
            }
        }
    }
}
