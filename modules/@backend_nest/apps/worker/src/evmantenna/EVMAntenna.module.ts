import { Module } from '@nestjs/common';
import { BullModule, BullModuleOptions } from '@nestjs/bull';
import { ConfigService } from '@lib/common/config/Config.service';
import { EVMEventSetsModule } from '@lib/common/evmeventsets/EVMEventSets.module';
import { EVMAntennaMergerScheduler } from '@app/worker/evmantenna/EVMAntennaMerger.scheduler';
import { EventsModule } from '@lib/common/events/Events.module';
import { DatesModule } from '@lib/common/dates/Dates.module';
import { EVMBlockRollbacksModule } from '@lib/common/evmblockrollbacks/EVMBlockRollbacks.module';

@Module({
    imports: [
        EVMEventSetsModule,
        EVMBlockRollbacksModule,
        EventsModule,
        DatesModule,
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
    providers: [EVMAntennaMergerScheduler],
})
export class EVMAntennaModule {}
