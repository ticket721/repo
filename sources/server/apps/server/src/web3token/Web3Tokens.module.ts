import { Module } from '@nestjs/common';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { Web3TokenEntity } from '@app/server/web3token/entities/Web3Token.entity';
import { Web3TokensRepository } from '@app/server/web3token/Web3Tokens.repository';
import { Web3TokensService } from '@app/server/web3token/Web3Tokens.service';
import { ConfigModule } from '@lib/common/config/Config.module';
import { Config } from '@app/server/utils/Config.joi';

/**
 * Module to handle the creation and verification of web3 tokens. They prevent replay attacks
 */
@Module({
    imports: [
        ExpressCassandraModule.forFeature([
            Web3TokenEntity,
            Web3TokensRepository,
        ]),
        ConfigModule.register(Config),
        // BullModule.registerQueueAsync({
        //         imports: [ConfigModule.register(Config)],
        //         inject: [ConfigService],
        //         name: 'web3token/clear',
        //         useFactory: (configService: ConfigService): BullModuleOptions => ({
        //             name: 'web3token/clear',
        //             redis: {
        //                 host: configService.get('BULL_REDIS_HOST'),
        //                 port: parseInt(configService.get('BULL_REDIS_PORT'))
        //             }
        //         })
        //     }
        // )
    ],
    providers: [Web3TokensService],
    exports: [Web3TokensService],
})
export class Web3TokensModule {}
