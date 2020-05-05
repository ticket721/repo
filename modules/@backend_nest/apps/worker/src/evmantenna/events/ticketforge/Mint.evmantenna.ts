import { Appender, EVMEventControllerBase } from '@app/worker/evmantenna/EVMEvent.controller.base';
import { GlobalConfigService }      from '@lib/common/globalconfig/GlobalConfig.service';
import { InjectSchedule, Schedule } from 'nest-schedule';
import { ShutdownService }          from '@lib/common/shutdown/Shutdown.service';
import { OutrospectionService }     from '@lib/common/outrospection/Outrospection.service';
import { InjectQueue }              from '@nestjs/bull';
import { Queue }                    from 'bull';
import { EVMEventSetsService }      from '@lib/common/evmeventsets/EVMEventSets.service';
import { EventsService }            from '@lib/common/events/Events.service';
import { EVMProcessableEvent }      from '@app/worker/evmantenna/EVMAntennaMerger.scheduler';
import { TicketforgeService }       from '@lib/common/contracts/Ticketforge.service';

/**
 * EVM Antenna to intercept NewCategory events emitted by the T721Controller
 */
export class MintTicketForgeEVMAntenna extends EVMEventControllerBase {
    /**
     * Dependency Injection
     *
     * @param ticketforgeService
     * @param scheduler
     * @param queue
     * @param globalConfigService
     * @param shutdownService
     * @param outrospectionService
     * @param evmEventSetsService
     * @param eventsService
     */
    constructor(
        ticketforgeService: TicketforgeService,
        @InjectSchedule() scheduler: Schedule,
        @InjectQueue('evmantenna') queue: Queue,
        globalConfigService: GlobalConfigService,
        shutdownService: ShutdownService,
        outrospectionService: OutrospectionService,
        evmEventSetsService: EVMEventSetsService,
        private readonly eventsService: EventsService,
    ) {
        super(
            ticketforgeService,
            scheduler,
            queue,
            globalConfigService,
            shutdownService,
            outrospectionService,
            evmEventSetsService,
            'Mint',
        );
    }

    /**
     * Event Converter
     *
     * @param event
     * @param append
     */
    async convert(event: EVMProcessableEvent, append: Appender): Promise<any> {
        console.log('Ticket Minting Event Caught');
    }
}
