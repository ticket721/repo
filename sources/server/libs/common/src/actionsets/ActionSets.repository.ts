import { EntityRepository, Repository } from '@iaminfinity/express-cassandra';
import { ActionSetEntity } from '@lib/common/actionsets/entity/ActionSet.entity';

/**
 * ActionSet entity repository
 */
@EntityRepository(ActionSetEntity)
export class ActionSetsRepository extends Repository<ActionSetEntity> {}
