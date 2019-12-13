import { Module }                        from '@nestjs/common';
import { AppController }                 from './app.controller';
import { AppService }                    from './app.service';
import { ExpressCassandraModule }        from '@iaminfinity/express-cassandra';
import { ExpressCassandraConfigService } from './express-cassandra/express-cassandra-config.service';
import { ExpressCassandraConfigModule }  from './express-cassandra/express-cassandra-config.module';
import { ConfigModule }                  from './config/config.module';
import { UsersModule }                   from './api/user/users.module';
import { UserEntity }                    from './api/user/entities/user.entity';
import { UsersRepository }               from './api/user/users.repository';


@Module({
    imports: [
        ExpressCassandraModule.forRootAsync({
            imports: [ExpressCassandraConfigModule],
            useFactory: async (configService: ExpressCassandraConfigService) => await configService.createUserKeyspaceOptions(),
            inject: [ExpressCassandraConfigService]
        }),
        ExpressCassandraModule.forFeature([UserEntity, UsersRepository]),
        UsersModule,
        ConfigModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
