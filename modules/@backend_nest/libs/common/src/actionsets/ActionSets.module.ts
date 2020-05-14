import { Module } from '@nestjs/common';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { ActionSetsRepository } from '@lib/common/actionsets/ActionSets.repository';
import { BullModule, BullModuleOptions } from '@nestjs/bull';
import { ConfigService } from '@lib/common/config/Config.service';
import { ScheduleModule } from 'nest-schedule';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';
import { ActionSetsRightsConfig } from '@lib/common/actionsets/ActionSets.rights';
import { RightsModule } from '@lib/common/rights/Rights.module';

@Module({
    imports: [
        ExpressCassandraModule.forFeature([ActionSetEntity, ActionSetsRepository]),
        BullModule.registerQueueAsync({
            inject: [ConfigService],
            name: 'action',
            useFactory: (configService: ConfigService): BullModuleOptions => ({
                name: 'action',
                redis: {
                    host: configService.get('BULL_REDIS_HOST'),
                    port: parseInt(configService.get('BULL_REDIS_PORT'), 10),
                },
            }),
        }),
        ScheduleModule.register(),
        RightsModule,
    ],
    providers: [
        ActionSetsService,
        {
            provide: WinstonLoggerService,
            useValue: new WinstonLoggerService('actionset'),
        },

        {
            provide: '@rights/actionset',
            useValue: ActionSetsRightsConfig,
        },
    ],
    exports: [ActionSetsService],
})
export class ActionSetsModule {}
