import { Module } from '@nestjs/common';
import { BullModule, BullModuleOptions } from '@nestjs/bull';
import { ConfigService } from '@lib/common/config/Config.service';
import { EVMEventSetsModule } from '@lib/common/evmeventsets/EVMEventSets.module';
import { EVMAntennaMergerScheduler } from '@app/worker/evmantenna/EVMAntennaMerger.scheduler';
import { EventsModule } from '@lib/common/events/Events.module';
import { DatesModule } from '@lib/common/dates/Dates.module';
import { EVMBlockRollbacksModule } from '@lib/common/evmblockrollbacks/EVMBlockRollbacks.module';
import { MintT721ControllerEVMAntenna } from '@app/worker/evmantenna/events/t721controller/Mint.evmantenna';
import { TicketsModule } from '@lib/common/tickets/Tickets.module';
import { CategoriesModule } from '@lib/common/categories/Categories.module';
import { AuthorizationsModule } from '@lib/common/authorizations/Authorizations.module';
import { GroupModule } from '@lib/common/group/Group.module';
import { WinstonLoggerModule } from '@lib/common/logger/WinstonLogger.module';

@Module({
    imports: [
        EVMEventSetsModule,
        EVMBlockRollbacksModule,
        EventsModule,
        DatesModule,
        TicketsModule,
        CategoriesModule,
        AuthorizationsModule,
        GroupModule,
        WinstonLoggerModule,
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
        // T721Controller
        MintT721ControllerEVMAntenna,

        EVMAntennaMergerScheduler,
    ],
})
export class EVMAntennaModule {}
