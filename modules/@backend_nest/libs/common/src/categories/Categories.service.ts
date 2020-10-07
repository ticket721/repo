import { CRUDExtension } from '@lib/common/crud/CRUDExtension.base';
import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';
import { CategoriesRepository } from '@lib/common/categories/Categories.repository';

/**
 * Service to CRUD CategoryEntities
 */
export class CategoriesService extends CRUDExtension<CategoriesRepository, CategoryEntity> {
    /**
     * Dependency injection
     *
     * @param categoriesRepository
     * @param categoryEntity
     */
    constructor(
        @InjectRepository(CategoriesRepository)
        categoriesRepository: CategoriesRepository,
        @InjectModel(CategoryEntity)
        categoryEntity: BaseModel<CategoryEntity>,
    ) {
        super(
            categoryEntity,
            categoriesRepository,
            /* istanbul ignore next */
            (e: CategoryEntity) => {
                return new categoryEntity(e);
            },
            /* istanbul ignore next */
            (c: CategoryEntity) => {
                return new CategoryEntity(c);
            },
        );
    }
}
