import { Module }                        from '@nestjs/common';
import { ExpressCassandraModule }        from '@iaminfinity/express-cassandra';
import { AuthenticationModule }         from './authentication/Authentication.module';
import { ServerController }              from './Server.controller';
import { ServerService }                 from './Server.service';
import { ScheduleModule }                from 'nest-schedule';
import { SchedulerService }              from './scheduler/Scheduler.service';
import { UsersRepository }               from '@lib/common/users/Users.repository';
import { UserEntity }                    from '@lib/common/users/entities/User.entity';
import { UsersModule }                   from '@lib/common/users/Users.module';
import { ConfigModule }                  from '@lib/common/config/Config.module';
import { TaskQueueModule }               from './taskqueue/TaskQueue.module';
import { Config }                        from './utils/Config.joi';
import { ExpressCassandraConfigModule }  from '@app/server/express-cassandra/ExpressCassandraConfig.module';
import { ExpressCassandraConfigService } from '@app/server/express-cassandra/ExpressCassandraConfig.service';
import { Web3TokenEntity }               from '@app/server/web3token/entities/Web3Token.entity';
import { Web3TokensRepository }          from '@app/server/web3token/Web3Tokens.repository';
import { Web3TokensModule }              from '@app/server/web3token/Web3Tokens.module';

@Module({
    imports: [
        ConfigModule.forRoot(Config),
        ScheduleModule.register(),
        ExpressCassandraModule.forRootAsync({
            imports: [ExpressCassandraConfigModule],
            useFactory: async (configService: ExpressCassandraConfigService) => await configService.createUserKeyspaceOptions(),
            inject: [ExpressCassandraConfigService],
        }),
        ExpressCassandraModule.forFeature([UserEntity, UsersRepository, Web3TokenEntity, Web3TokensRepository]),
        UsersModule,
        Web3TokensModule,
        AuthenticationModule,
        TaskQueueModule
    ],
    controllers: [
        ServerController,
    ],
    providers: [
        ServerService,
        SchedulerService,
    ],
})
export class ServerModule {
}
