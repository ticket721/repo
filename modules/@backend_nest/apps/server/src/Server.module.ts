import { Module } from '@nestjs/common';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { AuthenticationModule } from './authentication/Authentication.module';
import { ServerService } from './Server.service';
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
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import { ActionSetsModule } from '@lib/common/actionsets/ActionSets.module';
import { ActionSetsRepository } from '@lib/common/actionsets/ActionSets.repository';
import { ActionSetsController } from '@app/server/controllers/actionsets/ActionSets.controller';
import { DatesModule } from '@lib/common/dates/Dates.module';
import { DatesController } from '@app/server/controllers/dates/Dates.controller';
import { EventsModule } from '@lib/common/events/Events.module';
import { EventsController } from '@app/server/controllers/events/Events.controller';
import { ImagesController } from '@app/server/controllers/images/Images.controller';
import { ImagesModule } from '@lib/common/images/Images.module';
import { FSModule } from '@lib/common/fs/FS.module';
import { CurrenciesModule } from '@lib/common/currencies/Currencies.module';
import { TxsModule } from '@lib/common/txs/Txs.module';
import { TxsServiceOptions } from '@lib/common/txs/Txs.service';
import { GlobalConfigModule } from '@lib/common/globalconfig/GlobalConfig.module';
import { GlobalConfigOptions } from '@lib/common/globalconfig/GlobalConfig.service';
import { TxsController } from '@app/server/controllers/txs/Txs.controller';
import { ContractsController } from '@app/server/controllers/contracts/Contracts.controller';
import { BinanceModule, BinanceModuleBuildOptions } from '@lib/common/binance/Binance.module';
import { OutrospectionModule } from '@lib/common/outrospection/Outrospection.module';
import { EmailModule } from '@lib/common/email/Email.module';
import { DosojinController } from '@app/server/controllers/dosojin/Dosojin.controller';
import { GemOrdersModule } from '@lib/common/gemorders/GemOrders.module';
import { CheckoutController } from '@app/server/controllers/checkout/Checkout.controller';
import { StripeResourcesModule } from '@lib/common/striperesources/StripeResources.module';
import { ToolBoxModule } from '@lib/common/toolbox/ToolBox.module';
import { CategoriesModule } from '@lib/common/categories/Categories.module';
import { RightsModule } from '@lib/common/rights/Rights.module';
import { CategoriesController } from '@app/server/controllers/categories/Categories.controller';
import { RightsController } from '@app/server/controllers/rights/Rights.controller';
import { ServerController } from '@app/server/controllers/server/Server.controller';
import { MetadatasController } from '@app/server/controllers/metadatas/Metadatas.controller';
import { MetadatasModule } from '@lib/common/metadatas/Metadatas.module';
import { AuthorizationsModule } from '@lib/common/authorizations/Authorizations.module';
import { CheckoutModule } from '@lib/common/checkout/Checkout.module';
import { CartModule } from '@lib/common/cart/Cart.module';
import { RocksideModule } from '@lib/common/rockside/Rockside.module';

@Module({
    imports: [
        // Global configuration reading .env file
        ConfigModule.register(Config, './apps/server/env/'),

        // Cassandra ORM setup
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
            ActionSetEntity,
            ActionSetsRepository,
        ]),

        // Cassandra Table Modules & Utils
        UsersModule,
        ImagesModule,
        Web3TokensModule,
        ActionSetsModule,
        DatesModule,
        CategoriesModule,
        RightsModule,
        EventsModule,
        GemOrdersModule,
        StripeResourcesModule,
        MetadatasModule,
        AuthorizationsModule,
        CurrenciesModule,

        CheckoutModule,
        CartModule,

        // User Management Modules
        AuthenticationModule,

        // Utility Modules
        FSModule,
        ShutdownModule,
        ToolBoxModule,

        // Notification Modules
        EmailModule,

        RocksideModule.register(),

        // Web3 & Ethereum Modules
        Web3Module.registerAsync({
            useFactory: (configService: ConfigService): Web3ServiceOptions => ({
                Web3,
                host: configService.get('ETHEREUM_NODE_HOST'),
                port: configService.get('ETHEREUM_NODE_PORT'),
                protocol: configService.get('ETHEREUM_NODE_PROTOCOL'),
            }),
            inject: [ConfigService],
        }),
        ContractsModule.registerAsync({
            useFactory: (configService: ConfigService): ContractsServiceOptions => ({
                artifact_path: configService.get('CONTRACTS_ARTIFACTS_PATH'),
            }),
            inject: [ConfigService],
        }),
        TxsModule.registerAsync({
            useFactory: (configService: ConfigService): TxsServiceOptions => ({
                blockThreshold: parseInt(configService.get('TXS_BLOCK_THRESHOLD'), 10),
                blockPollingRefreshRate: parseInt(configService.get('TXS_BLOCK_POLLING_REFRESH_RATE'), 10),
                ethereumNetworkId: parseInt(configService.get('ETHEREUM_NODE_NETWORK_ID'), 10),
                ethereumMtxDomainName: configService.get('ETHEREUM_MTX_DOMAIN_NAME'),
                ethereumMtxVersion: configService.get('ETHEREUM_MTX_VERSION'),
                ethereumMtxRelayAdmin: configService.get('VAULT_ETHEREUM_ASSIGNED_ADMIN'),
                targetGasPrice: parseInt(configService.get('TXS_TARGET_GAS_PRICE'), 10),
            }),
            inject: [ConfigService],
        }),
        BinanceModule.registerAsync({
            useFactory: (configService: ConfigService): BinanceModuleBuildOptions => ({
                mock: configService.get('GLOBAL_CONFIG_BINANCE_MOCK') !== 'false',
            }),
            inject: [ConfigService],
        }),
        GlobalConfigModule.registerAsync({
            useFactory: (configService: ConfigService): GlobalConfigOptions => ({
                blockNumberFetchingRate: parseInt(configService.get('GLOBAL_CONFIG_BLOCK_NUMBER_FETCHING_RATE'), 10),
                ethereumPriceFetchingRate: parseInt(
                    configService.get('GLOBAL_CONFIG_ETHEREUM_PRICE_FETCHING_RATE'),
                    10,
                ),
            }),
            inject: [ConfigService],
        }),
        OutrospectionModule.register({
            name: 'server',
        }),
    ],
    controllers: [
        ServerController,
        ImagesController,
        ActionSetsController,
        DatesController,
        EventsController,
        TxsController,
        ContractsController,
        DosojinController,
        CheckoutController,
        CategoriesController,
        RightsController,
        MetadatasController,
    ],
    providers: [
        ServerService,

        // Global logger
        {
            provide: WinstonLoggerService,
            useValue: new WinstonLoggerService('server'),
        },
    ],
})
export class ServerModule {}
