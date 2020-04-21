import { Module } from '@nestjs/common';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { AuthorizationsService } from '@lib/common/authorizations/Authorizations.service';
import { AuthorizationsRepository } from '@lib/common/authorizations/Authorizations.repository';
import { AuthorizationEntity } from '@lib/common/authorizations/entities/Authorization.entity';
import { CategoriesModule } from '@lib/common/categories/Categories.module';
import { BullModule, BullModuleOptions } from '@nestjs/bull';
import { ConfigService } from '@lib/common/config/Config.service';
import { EventsModule } from '@lib/common/events/Events.module';
import { DatesModule } from '@lib/common/dates/Dates.module';

@Module({
    imports: [
        ExpressCassandraModule.forFeature([AuthorizationEntity, AuthorizationsRepository]),
        BullModule.registerQueueAsync({
            inject: [ConfigService],
            name: 'authorization',
            useFactory: (configService: ConfigService): BullModuleOptions => ({
                name: 'authorization',
                redis: {
                    host: configService.get('BULL_REDIS_HOST'),
                    port: parseInt(configService.get('BULL_REDIS_PORT'), 10),
                },
            }),
        }),
        CategoriesModule,
        EventsModule,
        DatesModule,
    ],
    providers: [AuthorizationsService],
    exports: [AuthorizationsService],
})
export class AuthorizationsModule {}
