import { Module } from '@nestjs/common';
import { ConfigModule } from '@lib/common/config/Config.module';
import { Config } from '@app/worker/utils/Config.joi';
import { ScheduleModule } from 'nest-schedule';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { ExpressCassandraConfigModule } from '@app/worker/express-cassandra/ExpressCassandraConfig.module';
import { ExpressCassandraConfigService } from '@app/worker/express-cassandra/ExpressCassandraConfig.service';
import { UserEntity } from '@lib/common/users/entities/User.entity';
import { UsersRepository } from '@lib/common/users/Users.repository';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import { ActionSetsRepository } from '@lib/common/actionsets/ActionSets.repository';
import { UsersModule } from '@lib/common/users/Users.module';
import { ImagesModule } from '@lib/common/images/Images.module';
import { ActionSetsModule } from '@lib/common/actionsets/ActionSets.module';
import { DatesModule } from '@lib/common/dates/Dates.module';
import { EventsModule } from '@lib/common/events/Events.module';
import { CurrenciesModule } from '@lib/common/currencies/Currencies.module';
import { ConfigService } from '@lib/common/config/Config.service';
import { FSModule } from '@lib/common/fs/FS.module';
import { ShutdownModule } from '@lib/common/shutdown/Shutdown.module';
import { Web3Module } from '@lib/common/web3/Web3.module';
import { Web3ServiceOptions } from '@lib/common/web3/Web3.service';
import Web3 from 'web3';
import { ContractsModule } from '@lib/common/contracts/Contracts.module';
import { ContractsServiceOptions } from '@lib/common/contracts/Contracts.service';
import { TxsModule } from '@lib/common/txs/Txs.module';
import { TxsServiceOptions } from '@lib/common/txs/Txs.service';
import { BinanceModule, BinanceModuleBuildOptions } from '@lib/common/binance/Binance.module';
import { GlobalConfigModule } from '@lib/common/globalconfig/GlobalConfig.module';
import { GlobalConfigOptions } from '@lib/common/globalconfig/GlobalConfig.service';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';
import { OutrospectionModule } from '@lib/common/outrospection/Outrospection.module';
import { EmailModule } from '@lib/common/email/Email.module';
import { EventsInputHandlers } from '@app/worker/actionhandlers/events/Events.input.handlers';
import { ActionSetsTasks } from '@app/worker/tasks/actionsets/ActionSets.tasks';
import { ActionSetsScheduler } from '@app/worker/schedulers/actionsets/ActionSets.scheduler';
import { TxsScheduler } from '@app/worker/schedulers/txs/Txs.scheduler';
import { EVMAntennaModule } from '@app/worker/evmantenna/EVMAntenna.module';
import { GlobalConfigScheduler } from '@app/worker/schedulers/globalconfig/GlobalConfig.scheduler';
import { EVMEventSetsModule } from '@lib/common/evmeventsets/EVMEventSets.module';
import { GemOrdersModule } from '@lib/common/gemorders/GemOrders.module';
import { DosojinRunnerModule } from '@app/worker/dosojinrunner/DosojinRunner.module';
import { CategoriesModule } from '@lib/common/categories/Categories.module';
import { RightsModule } from '@lib/common/rights/Rights.module';
import { CartInputHandlers } from '@app/worker/actionhandlers/cart/Cart.input.handlers';
import { AuthorizationsTasks } from '@app/worker/tasks/authorizations/Authorizations.tasks';
import { AuthorizationsModule } from '@lib/common/authorizations/Authorizations.module';
import { CheckoutInputHandlers } from '@app/worker/actionhandlers/checkout/Checkout.input.handlers';
import { CheckoutEventHandlers } from '@app/worker/actionhandlers/checkout/Checkout.event.handlers';
import { ToolBoxModule } from '@lib/common/toolbox/ToolBox.module';
import { MintingModule } from '@lib/common/minting/Minting.module';
import { MintingTasks } from '@app/worker/tasks/minting/Minting.tasks';
import { CheckoutModule } from '@lib/common/checkout/Checkout.module';
import { CartModule } from '@lib/common/cart/Cart.module';
import { TxSeqEventHandlers } from '@app/worker/actionhandlers/txseq/TxSeq.event.handlers';
import { GroupModule } from '@lib/common/group/Group.module';
import { TicketsModule } from '@lib/common/tickets/Tickets.module';
import { RocksideModule } from '@lib/common/rockside/Rockside.module';
import { AuthenticationModule } from '@app/worker/authentication/Authentication.module';
import { toHeaderFormat } from '@lib/common/utils/toHeaderFormat';
import { StatusController } from '@app/worker/utils/Status.controller';
import { WithdrawTasks } from '@app/worker/tasks/withdraw/Withdraw.tasks';
import { StripeModule, StripeModuleBuildOptions } from '@lib/common/stripe/Stripe.module';

@Module({
    imports: [
        // Global configuration reading .env file
        ConfigModule.register(Config, process.env.CONFIG_PATH || './apps/worker/env/'),

        // Scheduler to run background tasks
        ScheduleModule.register(),

        // Cassandra ORM setup
        ExpressCassandraModule.forRootAsync({
            imports: [ExpressCassandraConfigModule],
            useFactory: async (configService: ExpressCassandraConfigService) =>
                await configService.createUserKeyspaceOptions(),
            inject: [ExpressCassandraConfigService],
        }),
        ExpressCassandraModule.forFeature([UserEntity, UsersRepository, ActionSetEntity, ActionSetsRepository]),
        AuthenticationModule,

        // Cassandra Table Modules & Utils
        UsersModule,
        ImagesModule,
        ActionSetsModule,
        DatesModule,
        RightsModule,
        CategoriesModule,
        EventsModule,
        EVMEventSetsModule,
        GemOrdersModule,
        AuthorizationsModule,
        TicketsModule,
        CurrenciesModule,
        GroupModule,

        CheckoutModule,
        CartModule,
        MintingModule,

        RocksideModule.register(),

        // Ethereum Listeners
        EVMAntennaModule,

        StripeModule.registerAsync({
            useFactory: (configService: ConfigService): StripeModuleBuildOptions => ({
                stripePrivateKey: configService.get('DOSOJIN_STRIPE_PRIVATE_KEY'),
            }),
            inject: [ConfigService],
        }),

        // Dosojin Handler
        DosojinRunnerModule,

        // Utility Modules
        FSModule,
        ShutdownModule,
        ToolBoxModule,

        // Notification Modules
        EmailModule,

        // Web3 & Ethereum Modules
        Web3Module.registerAsync({
            useFactory: (configService: ConfigService): Web3ServiceOptions => ({
                Web3,
                host: configService.get('ETHEREUM_NODE_HOST'),
                port: configService.get('ETHEREUM_NODE_PORT'),
                protocol: configService.get('ETHEREUM_NODE_PROTOCOL'),
                headers: toHeaderFormat(JSON.parse(configService.get('ETHEREUM_NODE_HEADERS') || '{}')),
                path: configService.get('ETHEREUM_NODE_PATH'),
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
        OutrospectionModule.register('worker'),
    ],
    controllers: [StatusController],
    providers: [
        // ActionSet Input Handlers
        EventsInputHandlers,
        CartInputHandlers,
        CheckoutInputHandlers,

        // ActionSet Event Handlers
        CheckoutEventHandlers,
        TxSeqEventHandlers,

        // Bull Tasks
        WithdrawTasks,
        ActionSetsTasks,
        AuthorizationsTasks,
        MintingTasks,

        // Schedulers
        ActionSetsScheduler,
        GlobalConfigScheduler,
        TxsScheduler,

        // Global logger
        {
            provide: WinstonLoggerService,
            useValue: new WinstonLoggerService('worker'),
        },
    ],
})
export class WorkerModule {}
