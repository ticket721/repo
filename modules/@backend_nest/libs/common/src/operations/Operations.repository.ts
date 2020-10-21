import { EntityRepository, Repository } from '@iaminfinity/express-cassandra';
import { OperationEntity } from '@lib/common/operations/entities/Operation.entity';

/**
 * Repository to handle the Operation
 */
@EntityRepository(OperationEntity)
export class OperationsRepository extends Repository<OperationEntity> {}
