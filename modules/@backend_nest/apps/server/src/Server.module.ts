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
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';
import { ShutdownModule } from '@lib/common/shutdown/Shutdown.module';
import { DatesModule } from '@lib/common/dates/Dates.module';
import { DatesController } from '@app/server/controllers/dates/Dates.controller';
import { EventsModule } from '@lib/common/events/Events.module';
import { EventsController } from '@app/server/controllers/events/Events.controller';
import { ImagesController } from '@app/server/controllers/images/Images.controller';
import { FSModule } from '@lib/common/fs/FS.module';
import { OutrospectionModule } from '@lib/common/outrospection/Outrospection.module';
import { EmailModule } from '@lib/common/email/Email.module';
import { ToolBoxModule } from '@lib/common/toolbox/ToolBox.module';
import { CategoriesModule } from '@lib/common/categories/Categories.module';
import { CategoriesController } from '@app/server/controllers/categories/Categories.controller';
import { ServerController } from '@app/server/controllers/server/Server.controller';
import { TicketsController } from '@app/server/controllers/tickets/Tickets.controller';
import { TicketsModule } from '@lib/common/tickets/Tickets.module';
import { UsersController } from '@app/server/controllers/users/Users.controller';
import { VenmasController } from '@app/server/controllers/venmas/Venmas.controller';
import { GeolocController } from '@app/server/controllers/geoloc/Geoloc.controller';
import { StripeModule } from '@lib/common/stripe/Stripe.module';
import { FeatureFlagsModule } from '@lib/common/featureflags/FeatureFlags.module';
import { FeatureFlagsController } from '@app/server/controllers/featureflags/FeatureFlags.controller';
import { StripeInterfacesModule } from '@lib/common/stripeinterface/StripeInterfaces.module';
import { StripeController } from '@app/server/controllers/payment/stripe/Stripe.controller';
import { FilestoreModule } from '@lib/common/filestore/Filestore.module';
import { PurchasesModule } from '@lib/common/purchases/Purchases.module';
import { PurchasesController } from '@app/server/controllers/purchases/Purchases.controller';
import { VenmasModule } from '@lib/common/venmas/Venmas.module';

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
        ExpressCassandraModule.forFeature([UserEntity, UsersRepository, Web3TokenEntity, Web3TokensRepository]),

        // Cassandra Table Modules & Utils
        UsersModule,
        DatesModule,
        CategoriesModule,
        EventsModule,
        TicketsModule,
        PurchasesModule,
        VenmasModule,

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

        OutrospectionModule.register('server'),
    ],
    controllers: [
        ServerController,
        ImagesController,
        DatesController,
        EventsController,
        CategoriesController,
        TicketsController,
        UsersController,
        GeolocController,
        FeatureFlagsController,
        StripeController,
        PurchasesController,
        VenmasController,
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
