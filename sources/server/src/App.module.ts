import { Module }                        from '@nestjs/common';
import { AppController }                 from './App.controller';
import { AppService }                    from './App.service';
import { ExpressCassandraModule }        from '@iaminfinity/express-cassandra';
import { ExpressCassandraConfigService } from './express-cassandra/ExpressCassandraConfig.service';
import { AuthenticationService }         from './api/authentication/Authentication.service';
import { AuthenticationModule }          from './api/authentication/Authentication.module';
import { ExpressCassandraConfigModule }  from './express-cassandra/ExpressCassandraConfig.module';
import { ConfigModule }                  from './config/Config.module';
import { UsersModule }                   from './api/users/Users.module';
import { UserEntity }                    from './api/users/entities/User.entity';
import { UsersRepository }               from './api/users/Users.repository';

@Module({
    imports: [
        ExpressCassandraModule.forRootAsync({
            imports: [ExpressCassandraConfigModule],
            useFactory: async (configService: ExpressCassandraConfigService) => await configService.createUserKeyspaceOptions(),
            inject: [ExpressCassandraConfigService],
        }),
        ExpressCassandraModule.forFeature([UserEntity, UsersRepository]),
        UsersModule,
        ConfigModule,
        AuthenticationModule
    ],
    controllers: [AppController],
    providers: [
        AppService,
        AuthenticationService
    ],
})
export class AppModule {
}
