import { CRUDExtension } from '@lib/common/crud/CRUDExtension.base';
import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';
import { CategoriesRepository } from '@lib/common/categories/Categories.repository';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';

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

    /**
     * Bind category to parent entity
     *
     * @param id
     * @param entity
     * @param entityId
     */
    async bind(id: string, entity: string, entityId: string): Promise<ServiceResponse<CategoryEntity>> {
        const category = await this.search({
            id,
        });

        if (category.error) {
            return {
                error: category.error,
                response: null,
            };
        }

        if (category.response.length === 0) {
            return {
                error: 'category_not_found',
                response: null,
            };
        }

        if (this.isBound(category.response[0])) {
            return {
                error: 'category_already_bound',
                response: null,
            };
        }

        const boundReq = await this.update(
            {
                id,
            },
            {
                parent_id: entityId,
                parent_type: entity,
            },
        );

        if (boundReq.error) {
            return {
                error: boundReq.error,
                response: null,
            };
        }

        return {
            error: null,
            response: {
                ...category.response[0],
                parent_id: entityId,
                parent_type: entity,
            },
        };
    }

    /**
     * Checks if entity is bound
     *
     * @param category
     */
    isBound(category: CategoryEntity): boolean {
        return !!(category.parent_type && category.parent_id);
    }

    /**
     * Removes binding to the entity
     *
     * @param id
     */
    async unbind(id: string): Promise<ServiceResponse<CategoryEntity>> {
        const category = await this.search({
            id,
        });

        if (category.error) {
            return {
                error: category.error,
                response: null,
            };
        }

        if (category.response.length === 0) {
            return {
                error: 'category_not_found',
                response: null,
            };
        }

        if (!this.isBound(category.response[0])) {
            return {
                error: 'category_not_bound',
                response: null,
            };
        }

        const boundReq = await this.update(
            {
                id,
            },
            {
                parent_id: null,
                parent_type: null,
            },
        );

        if (boundReq.error) {
            return {
                error: boundReq.error,
                response: null,
            };
        }

        return {
            error: null,
            response: {
                ...category.response[0],
                parent_id: null,
                parent_type: null,
            },
        };
    }
}
