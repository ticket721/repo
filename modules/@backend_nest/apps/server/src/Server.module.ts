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
import { ToolBoxModule } from '@lib/common/toolbox/ToolBox.module';
import { CategoriesModule } from '@lib/common/categories/Categories.module';
import { RightsModule } from '@lib/common/rights/Rights.module';
import { CategoriesController } from '@app/server/controllers/categories/Categories.controller';
import { RightsController } from '@app/server/controllers/rights/Rights.controller';
import { ServerController } from '@app/server/controllers/server/Server.controller';
import { MetadatasController } from '@app/server/controllers/metadatas/Metadatas.controller';
import { MetadatasModule } from '@lib/common/metadatas/Metadatas.module';
import { CartModule } from '@lib/common/cart/Cart.module';
import { RocksideModule } from '@lib/common/rockside/Rockside.module';
import { TicketsController } from '@app/server/controllers/tickets/Tickets.controller';
import { TicketsModule } from '@lib/common/tickets/Tickets.module';
import { UsersController } from '@app/server/controllers/users/Users.controller';
import { toHeaderFormat } from '@lib/common/utils/toHeaderFormat';
import { GeolocController } from '@app/server/controllers/geoloc/Geoloc.controller';
import { StripeModule } from '@lib/common/stripe/Stripe.module';
import { FeatureFlagsModule } from '@lib/common/featureflags/FeatureFlags.module';
import { FeatureFlagsController } from '@app/server/controllers/featureflags/FeatureFlags.controller';
import { StripeInterfacesModule } from '@lib/common/stripeinterface/StripeInterfaces.module';
import { StripeController } from '@app/server/controllers/payment/stripe/Stripe.controller';
import { FilestoreModule } from '@lib/common/filestore/Filestore.module';
import { PurchasesModule } from '@lib/common/purchases/Purchases.module';
import { PurchasesController } from '@app/server/controllers/purchases/Purchases.controller';

@Module({
    imports: [
        // Global configuration reading .env file
        ConfigModule.register(Config, process.env.CONFIG_PATH || './apps/server/env/'),

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
        Web3TokensModule,
        ActionSetsModule,
        DatesModule,
        CategoriesModule,
        RightsModule,
        EventsModule,
        MetadatasModule,
        CurrenciesModule,
        TicketsModule,
        PurchasesModule,

        CartModule,
        StripeModule.register(),
        StripeInterfacesModule,

        // User Management Modules
        AuthenticationModule,

        // Utility Modules
        FSModule,
        ShutdownModule,
        ToolBoxModule,
        FilestoreModule,

        FeatureFlagsModule,

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
                headers: toHeaderFormat(JSON.parse(configService.get('ETHEREUM_NODE_HEADERS', '{}'))),
                path: configService.get('ETHEREUM_NODE_PATH', null),
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
        OutrospectionModule.register('server'),
    ],
    controllers: [
        ServerController,
        ImagesController,
        ActionSetsController,
        DatesController,
        EventsController,
        TxsController,
        ContractsController,
        CategoriesController,
        RightsController,
        MetadatasController,
        TicketsController,
        UsersController,
        GeolocController,
        FeatureFlagsController,
        StripeController,
        PurchasesController,
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
