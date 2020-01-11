import { EntityRepository, Repository } from '@iaminfinity/express-cassandra';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';

/**
 * ActionSet entity repository
 */
@EntityRepository(ActionSetEntity)
export class ActionSetsRepository extends Repository<ActionSetEntity> {}
