import { Module } from '@nestjs/common';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { AuthenticationModule } from './authentication/Authentication.module';
import { ServerController } from './Server.controller';
import { ServerService } from './Server.service';
import { ScheduleModule } from 'nest-schedule';
import { UsersRepository } from '@lib/common/users/Users.repository';
import { UserEntity } from '@lib/common/users/entities/User.entity';
import { UsersModule } from '@lib/common/users/Users.module';
import { ConfigModule } from '@lib/common/config/Config.module';
import { Config } from './utils/Config.joi';
import { ExpressCassandraConfigModule } from '@app/server/express-cassandra/ExpressCassandraConfig.module';
import { ExpressCassandraConfigService } from '@app/server/express-cassandra/ExpressCassandraConfig.service';
import { Web3TokenEntity } from '@app/server/web3token/entities/Web3Token.entity';
import { Web3TokensRepository } from '@app/server/web3token/Web3Tokens.repository';
import { Web3TokensModule } from '@app/server/web3token/Web3Tokens.module';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';
import Web3 from 'web3';
import { ConfigService } from '@lib/common/config/Config.service';
import { Web3Module } from '@lib/common/web3/Web3.module';
import { Web3ServiceOptions } from '@lib/common/web3/Web3.service';
import { ContractsModule } from '@lib/common/contracts/Contracts.module';
import { ContractsServiceOptions } from '@lib/common/contracts/Contracts.service';
import { ShutdownModule } from '@lib/common/shutdown/Shutdown.module';

@Module({
    imports: [
        ConfigModule.register(Config),
        ScheduleModule.register(),
        ExpressCassandraModule.forRootAsync({
            imports: [ExpressCassandraConfigModule],
            useFactory: async (configService: ExpressCassandraConfigService) =>
                await configService.createUserKeyspaceOptions(),
            inject: [ExpressCassandraConfigService],
        }),
        ExpressCassandraModule.forFeature([
            UserEntity,
            UsersRepository,
            Web3TokenEntity,
            Web3TokensRepository,
        ]),
        UsersModule,
        Web3TokensModule,
        AuthenticationModule,
        Web3Module.registerAsync({
            imports: [ConfigModule.register(Config)],
            useFactory: (configService: ConfigService): Web3ServiceOptions => ({
                Web3,
                host: configService.get('ETHEREUM_NODE_HOST'),
                port: configService.get('ETHEREUM_NODE_PORT'),
                protocol: configService.get('ETHEREUM_NODE_PROTOCOL'),
            }),
            inject: [ConfigService],
        }),
        ContractsModule.registerAsync({
            imports: [ConfigModule.register(Config)],
            useFactory: (
                configService: ConfigService,
            ): ContractsServiceOptions => ({
                artifact_path: configService.get('CONTRACTS_ARTIFACTS_PATH'),
            }),
            inject: [ConfigService],
        }),
        ShutdownModule,
    ],
    controllers: [ServerController],
    providers: [
        ServerService,
        {
            provide: WinstonLoggerService,
            useValue: new WinstonLoggerService('server'),
        },
    ],
})
export class ServerModule {}
