import { Module }                 from '@nestjs/common';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { UserEntity }             from './entities/User.entity';
import { UsersRepository }        from './Users.repository';
import { UsersService }           from './Users.service';

/**
 * Module handling the User entity
 */
@Module({
    imports: [
        ExpressCassandraModule.forFeature([UserEntity, UsersRepository]),
    ],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {
}
