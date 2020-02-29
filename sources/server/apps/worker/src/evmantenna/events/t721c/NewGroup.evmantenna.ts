import {
    Appender,
    EVMEventControllerBase,
} from '@app/worker/evmantenna/EVMEvent.controller.base';
import { GlobalConfigService } from '@lib/common/globalconfig/GlobalConfig.service';
import { InjectSchedule, Schedule } from 'nest-schedule';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { T721ControllerV0Service } from '@lib/common/contracts/t721controller/T721Controller.V0.service';
import { OutrospectionService } from '@lib/common/outrospection/Outrospection.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EVMEventSetsService } from '@lib/common/evmeventsets/EVMEventSets.service';
import { EventsService } from '@lib/common/events/Events.service';
import { EVMProcessableEvent } from '@app/worker/evmantenna/EVMAntennaMerger.scheduler';
import { EventEntity } from '@lib/common/events/entities/Event.entity';

/**
 * EVM Antenna to intercept NewCategory events emitted by the T721Controller
 */
export class NewGroupT721CEVMAntenna extends EVMEventControllerBase {
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
    ) {
        super(
            t721ControllerService,
            scheduler,
            queue,
            globalConfigService,
            shutdownService,
            outrospectionService,
            evmEventSetsService,
            'NewGroup',
        );
    }

    /**
     * Event Converter
     *
     * @param event
     * @param append
     */
    async convert(event: EVMProcessableEvent, append: Appender): Promise<any> {
        const data = JSON.parse(event.return_values);

        const esQuery = {
            body: {
                query: {
                    bool: {
                        must: {
                            term: {
                                group_id: data.id.toLowerCase(),
                            },
                        },
                    },
                },
            },
        };

        const eventSearchRes = await this.eventsService.searchElastic(esQuery);

        if (eventSearchRes.error) {
            throw new Error(
                `NewGroupT721CEVMAntenna::convert | unable to recover appropriate event linked to id ${data.id}`,
            );
        }

        if (eventSearchRes.response.hits.total === 0) {
            return;
        }

        const eventEntity: EventEntity =
            eventSearchRes.response.hits.hits[0]._source;

        const eventUpdateRes = await NewGroupT721CEVMAntenna.rollbackableUpdate(
            this.eventsService,
            {
                id: eventEntity.id,
            },
            {
                status: {
                    old: 'preview',
                    new: 'deployed',
                },
            },
            append,
        );

        if (eventUpdateRes.error) {
            throw new Error(
                `NewGroupT721CEVMAntenna::convert | error while creating event update query: ${eventUpdateRes.error}`,
            );
        }
    }
}
