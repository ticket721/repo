import { CRUDExtension } from '@lib/common/crud/CRUDExtension.base';
import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';
import { CategoriesRepository } from '@lib/common/categories/Categories.repository';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { fromES } from '@lib/common/utils/fromES.helper';

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

    public async findAllByGroupId(groupId: string): Promise<ServiceResponse<CategoryEntity[]>> {
        // Recover Event
        const categoriesCountRes = await this.countElastic({
            body: {
                query: {
                    bool: {
                        must: {
                            term: {
                                group_id: groupId,
                            },
                        },
                    },
                },
            },
        });

        if (categoriesCountRes.error) {
            return {
                error: 'error_while_counting',
                response: null,
            };
        }

        const total = categoriesCountRes.response.count;

        const categoriesRes = await this.searchElastic({
            body: {
                size: total,
                query: {
                    bool: {
                        must: {
                            term: {
                                group_id: groupId,
                            },
                        },
                    },
                },
            },
        });

        if (categoriesRes.error) {
            return {
                error: 'error_while_checking',
                response: null,
            };
        }

        return {
            response: categoriesRes.response.hits.hits.map(fromES),
            error: null,
        };
    }

    async findOne(categoryId: string): Promise<ServiceResponse<CategoryEntity>> {
        // Recover Event
        const categoryRes = await this.search({
            id: categoryId,
        });

        if (categoryRes.error) {
            return {
                error: 'error_while_checking',
                response: null,
            };
        }

        if (categoryRes.response.length === 0) {
            return {
                error: 'not_found',
                response: null,
            };
        }

        return {
            response: categoryRes.response[0],
            error: null,
        };
    }

    public static interfaceFromCurrencyAndPrice(currency: string, price: number): 'stripe' | 'none' {
        switch (currency) {
            case 'FREE': {
                return 'none';
            }
            default: {
                return 'stripe';
            }
        }
    }
}
