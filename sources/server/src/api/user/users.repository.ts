import { EntityRepository, Repository } from '@iaminfinity/express-cassandra';
import { UserEntity }                   from './entities/user.entity';

@EntityRepository(UserEntity)
export class UsersRepository extends Repository<UserEntity> {
}
