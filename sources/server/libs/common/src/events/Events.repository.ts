import { EntityRepository, Repository } from '@iaminfinity/express-cassandra';
import { EventEntity }                  from '@lib/common/events/entities/Event.entity';

/**
 * Repository of the DateEntity
 */
@EntityRepository(EventEntity)
export class EventsRepository extends Repository<EventEntity> {}
