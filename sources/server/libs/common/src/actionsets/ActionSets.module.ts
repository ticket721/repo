import { Module } from '@nestjs/common';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { ActionSetsRepository } from '@lib/common/actionsets/ActionSets.repository';
import { BullModule, BullModuleOptions } from '@nestjs/bull';
import { ConfigModule } from '@lib/common/config/Config.module';
import { Config } from '@app/server/utils/Config.joi';
import { ConfigService } from '@lib/common/config/Config.service';
import { ActionSetsTasks } from '@lib/common/actionsets/ActionSets.tasks';
import { ActionSetsScheduler } from '@lib/common/actionsets/ActionSets.scheduler';
import { ScheduleModule } from 'nest-schedule';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';

@Module({
    imports: [
        ExpressCassandraModule.forFeature([
            ActionSetEntity,
            ActionSetsRepository,
        ]),
        BullModule.registerQueueAsync({
            imports: [ConfigModule.register(Config)],
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
    ],
    providers: [
        ActionSetsService,
        ActionSetsTasks,
        ActionSetsScheduler,
        {
            provide: WinstonLoggerService,
            useValue: new WinstonLoggerService('actionset'),
        },
    ],
    exports: [ActionSetsService],
})
export class ActionSetsModule {}
