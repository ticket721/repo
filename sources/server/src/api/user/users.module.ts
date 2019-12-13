import { Module }                 from '@nestjs/common';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { UserEntity }             from './entities/user.entity';
import { UsersRepository }        from './users.repository';
import { UsersService }           from './users.service';

@Module({
    imports: [
        ExpressCassandraModule.forFeature([UserEntity, UsersRepository]),
    ],
    providers: [UsersService],
    exports: [UsersService]
})
export class UsersModule {}
