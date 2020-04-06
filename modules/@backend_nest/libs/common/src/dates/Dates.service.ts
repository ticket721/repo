import { CRUDExtension } from '@lib/common/crud/CRUDExtension.base';
import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';
import { DatesRepository } from '@lib/common/dates/Dates.repository';
import { DateEntity } from '@lib/common/dates/entities/Date.entity';
import { CategoriesService } from '@lib/common/categories/Categories.service';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { Boundable } from '@lib/common/utils/Boundable.type';

/**
 * Service to CRUD DateEntities
 */
export class DatesService extends CRUDExtension<DatesRepository, DateEntity> implements Boundable<DateEntity> {
    /**
     * Dependency injection
     *
     * @param datesRepository
     * @param dateEntity
     * @param categoriesService
     */
    constructor(
        @InjectRepository(DatesRepository)
        datesRepository: DatesRepository,
        @InjectModel(DateEntity)
        dateEntity: BaseModel<DateEntity>,
        private readonly categoriesService: CategoriesService,
    ) {
        super(
            dateEntity,
            datesRepository,
            /* istanbul ignore next */
            (e: DateEntity) => {
                return new dateEntity(e);
            },
            /* istanbul ignore next */
            (d: DateEntity) => {
                return new DateEntity(d);
            },
        );
    }

    /**
     * Creates Dates with given categories
     *
     * @param date
     * @param categories
     */
    async createDateWithCategories(
        date: Partial<DateEntity>,
        categories: Partial<CategoryEntity>[],
    ): Promise<ServiceResponse<[DateEntity, CategoryEntity[]]>> {
        const storedCategories: CategoryEntity[] = [];

        for (const category of categories) {
            if (category.group_id.toLowerCase() !== date.group_id.toLowerCase()) {
                return {
                    error: 'invalid_category_group_id',
                    response: null,
                };
            }

            const categoryCreationRes = await this.categoriesService.create(category);

            if (categoryCreationRes.error) {
                return {
                    error: categoryCreationRes.error,
                    response: null,
                };
            }

            storedCategories.push(categoryCreationRes.response);
        }

        date.categories = storedCategories.map((c: CategoryEntity): string => c.id);

        const dateCreationRes = await this.create(date);

        if (dateCreationRes.error) {
            return {
                error: dateCreationRes.error,
                response: null,
            };
        }

        return {
            error: null,
            response: [dateCreationRes.response, storedCategories],
        };
    }

    /**
     * Binds Date to controller entity
     *
     * @param id
     * @param entity
     * @param entityId
     */
    async bind(id: string, entity: string, entityId: string): Promise<ServiceResponse<DateEntity>> {
        const date = await this.search({
            id,
        });

        if (date.error) {
            return {
                error: date.error,
                response: null,
            };
        }

        if (date.response.length === 0) {
            return {
                error: 'entity_not_found',
                response: null,
            };
        }

        if (this.isBound(date.response[0])) {
            return {
                error: 'entity_already_bound',
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
                ...date.response[0],
                parent_id: entityId,
                parent_type: entity,
            },
        };
    }

    /**
     * Verifies if entity is bound
     * @param date
     */
    isBound(date: DateEntity): boolean {
        return !!(date.parent_type && date.parent_id);
    }

    /**
     * Unbinds entity
     *
     * @param id
     */
    async unbind(id: string): Promise<ServiceResponse<DateEntity>> {
        const date = await this.search({
            id,
        });

        if (date.error) {
            return {
                error: date.error,
                response: null,
            };
        }

        if (date.response.length === 0) {
            return {
                error: 'entity_not_found',
                response: null,
            };
        }

        if (!this.isBound(date.response[0])) {
            return {
                error: 'entity_not_bound',
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
                ...date.response[0],
                parent_id: null,
                parent_type: null,
            },
        };
    }
}
