import { EntityRepository, Repository } from '@iaminfinity/express-cassandra';
import { DateEntity } from '@lib/common/dates/entities/Date.entity';

/**
 * Repository of the DateEntity
 */
@EntityRepository(DateEntity)
export class DatesRepository extends Repository<DateEntity> {}
