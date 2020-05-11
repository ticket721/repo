import { Module } from '@nestjs/common';
import { BullModule, BullModuleOptions } from '@nestjs/bull';
import { ConfigService } from '@lib/common/config/Config.service';
import { EVMEventSetsModule } from '@lib/common/evmeventsets/EVMEventSets.module';
import { EVMAntennaMergerScheduler } from '@app/worker/evmantenna/EVMAntennaMerger.scheduler';
import { EventsModule } from '@lib/common/events/Events.module';
import { DatesModule } from '@lib/common/dates/Dates.module';
import { EVMBlockRollbacksModule } from '@lib/common/evmblockrollbacks/EVMBlockRollbacks.module';
import { MintTicketForgeEVMAntenna } from '@app/worker/evmantenna/events/ticketforge/Mint.evmantenna';
import { ApprovalT721TokenEVMAntenna } from '@app/worker/evmantenna/events/t721token/Approval.evmantenna';
import { MintT721TokenEVMAntenna } from '@app/worker/evmantenna/events/t721token/Mint.evmantenna';

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
    providers: [
        // T721Token
        ApprovalT721TokenEVMAntenna,
        MintT721TokenEVMAntenna,

        // TicketForge
        MintTicketForgeEVMAntenna,

        EVMAntennaMergerScheduler,
    ],
})
export class EVMAntennaModule {}
