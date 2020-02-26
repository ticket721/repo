import { Module } from '@nestjs/common';
import { NewGroupT721CEVMAntenna } from '@app/worker/evmantenna/events/t721c/NewGroup.evmantenna';
import { BullModule, BullModuleOptions } from '@nestjs/bull';
import { ConfigService } from '@lib/common/config/Config.service';
import { EVMEventSetsModule } from '@lib/common/evmeventsets/EVMEventSets.module';
import { EVMAntennaMergerScheduler } from '@app/worker/evmantenna/EVMAntennaMerger.scheduler';
import { NewCategoryT721CEVMAntenna } from '@app/worker/evmantenna/events/t721c/NewCategory.evmantenna';
import { EventsModule } from '@lib/common/events/Events.module';

@Module({
    imports: [
        EVMEventSetsModule,
        EventsModule,
        BullModule.registerQueueAsync({
            inject: [ConfigService],
            name: 'evmantenna',
            useFactory: (configService: ConfigService): BullModuleOptions => ({
                name: 'evmantenna',
                redis: {
                    host: configService.get('BULL_REDIS_HOST'),
                    port: parseInt(configService.get('BULL_REDIS_PORT'), 10),
                },
            }),
        }),
    ],
    providers: [
        // T721Controller_v0
        NewGroupT721CEVMAntenna,
        NewCategoryT721CEVMAntenna,

        EVMAntennaMergerScheduler,
    ],
})
export class EVMAntennaModule {}
