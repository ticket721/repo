import { Module }                        from '@nestjs/common';
import { BullModule, BullModuleOptions } from '@nestjs/bull';
import { ConfigService }                 from '@lib/common/config/Config.service';

@Module({
    imports: [
        BullModule.registerQueueAsync({
            inject: [ConfigService],
            name: 'minting',
            useFactory: (configService: ConfigService): BullModuleOptions => ({
                name: 'minting',
                redis: {
                    host: configService.get('BULL_REDIS_HOST'),
                    port: parseInt(configService.get('BULL_REDIS_PORT'), 10),
                },
            }),
        }),
    ]
})
export class MintingModule {}
