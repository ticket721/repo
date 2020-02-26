import { EVMEventControllerBase } from '@app/worker/evmantenna/EVMEvent.controller.base';
import { GlobalConfigService } from '@lib/common/globalconfig/GlobalConfig.service';
import { InjectSchedule, Schedule } from 'nest-schedule';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { T721ControllerV0Service } from '@lib/common/contracts/t721controller/T721Controller.V0.service';
import { OutrospectionService } from '@lib/common/outrospection/Outrospection.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EVMEventSetsService } from '@lib/common/evmeventsets/EVMEventSets.service';
import { EVMProcessableEvent } from '@app/worker/evmantenna/EVMAntennaMerger.scheduler';
import { DryResponse } from '@lib/common/crud/CRUD.extension';

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
     */
    constructor(
        t721ControllerService: T721ControllerV0Service,
        @InjectSchedule() scheduler: Schedule,
        @InjectQueue('evmantenna') queue: Queue,
        globalConfigService: GlobalConfigService,
        shutdownService: ShutdownService,
        outrospectionService: OutrospectionService,
        evmEventSetsService: EVMEventSetsService,
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
     * Event Converter
     *
     * @param event
     * @param append
     */
    async convert(
        event: EVMProcessableEvent,
        append: (res: DryResponse) => void,
    ): Promise<any> {
        console.log('convert NewCategory');
    }
}
