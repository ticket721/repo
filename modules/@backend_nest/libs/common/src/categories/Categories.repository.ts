import { EntityRepository, Repository } from '@iaminfinity/express-cassandra';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';

/**
 * Repository for the Category Entity
 */
@EntityRepository(CategoryEntity)
export class CategoriesRepository extends Repository<CategoryEntity> {}
