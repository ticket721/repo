import { EntityRepository, Repository } from '@iaminfinity/express-cassandra';
import { AuthorizationEntity } from '@lib/common/authorizations/entities/Authorization.entity';

/**
 * Repository for the Authorization Entity
 */
@EntityRepository(AuthorizationEntity)
export class AuthorizationsRepository extends Repository<AuthorizationEntity> {}
