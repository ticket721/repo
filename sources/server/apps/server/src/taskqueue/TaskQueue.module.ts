import { Module }                        from '@nestjs/common';
import { BullModule, BullModuleOptions } from '@nestjs/bull';
import { ConfigService }                 from '@lib/common/config/Config.service';
import { ConfigModule }                  from '@lib/common/config/Config.module';
import { Config }                        from '../utils/Config.joi';

@Module({
    imports: [
        BullModule.registerQueueAsync({
                imports: [ConfigModule.forRoot(Config)],
                inject: [ConfigService],
                name: 'queue',
                useFactory: (configService: ConfigService): BullModuleOptions => ({
                    name: 'queue',
                    redis: {
                        host: configService.get('BULL_REDIS_HOST'),
                        port: parseInt(configService.get('BULL_REDIS_PORT'))
                    }
                })
            }
        )
    ]
})
export class TaskQueueModule {
}
