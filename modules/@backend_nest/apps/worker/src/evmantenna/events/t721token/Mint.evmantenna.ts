import { Appender, EVMEventControllerBase } from '@app/worker/evmantenna/EVMEvent.controller.base';
import { GlobalConfigService } from '@lib/common/globalconfig/GlobalConfig.service';
import { InjectSchedule, Schedule } from 'nest-schedule';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { OutrospectionService } from '@lib/common/outrospection/Outrospection.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EVMEventSetsService } from '@lib/common/evmeventsets/EVMEventSets.service';
import { EVMProcessableEvent } from '@app/worker/evmantenna/EVMAntennaMerger.scheduler';
import { T721TokenService } from '@lib/common/contracts/T721Token.service';

/**
 * EVM Event handler for the Mint event on the T721Token contract
 */
export class MintT721TokenEVMAntenna extends EVMEventControllerBase {
    /**
     * Dependency Injection
     *
     * @param t721TokenService
     * @param scheduler
     * @param queue
     * @param globalConfigService
     * @param shutdownService
     * @param outrospectionService
     * @param evmEventSetsService
     */
    constructor(
        t721TokenService: T721TokenService,
        @InjectSchedule() scheduler: Schedule,
        @InjectQueue('evmantenna') queue: Queue,
        globalConfigService: GlobalConfigService,
        shutdownService: ShutdownService,
        outrospectionService: OutrospectionService,
        evmEventSetsService: EVMEventSetsService,
    ) {
        super(
            t721TokenService,
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
        console.log('Token Mint Event');
    }
}
