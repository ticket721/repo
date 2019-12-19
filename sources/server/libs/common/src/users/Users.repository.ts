import { EntityRepository, Repository } from '@iaminfinity/express-cassandra';
import { UserEntity }                   from './entities/User.entity';

/**
 * User entity repository
 */
@EntityRepository(UserEntity)
export class UsersRepository extends Repository<UserEntity> {
}
