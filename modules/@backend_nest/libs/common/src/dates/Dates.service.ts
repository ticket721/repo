import { CRUDExtension, CRUDResponse } from '@lib/common/crud/CRUDExtension.base';
import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';
import { DatesRepository } from '@lib/common/dates/Dates.repository';
import { DateEntity } from '@lib/common/dates/entities/Date.entity';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { CategoriesService } from '@lib/common/categories/Categories.service';
import { fromES } from '@lib/common/utils/fromES.helper';

/**
 * Service to CRUD DateEntities
 */
export class DatesService extends CRUDExtension<DatesRepository, DateEntity> {
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
     * Create a new date entity
     *
     * @param date
     */
    public async createDate(
        date: Omit<DateEntity, 'id' | 'event' | 'created_at' | 'updated_at'>,
    ): Promise<CRUDResponse<DateEntity>> {
        return this.create(date);
    }

    /**
     * List all dates linked to a groupe ID
     *
     * @param groupId
     */
    public async findAllByGroupId(groupId: string): Promise<ServiceResponse<DateEntity[]>> {
        const datesCountRes = await this.countElastic({
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

        if (datesCountRes.error) {
            return {
                error: 'error_while_counting',
                response: null,
            };
        }

        const total = datesCountRes.response.count;

        // Recover Event
        const dateRes = await this.searchElastic({
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

        if (dateRes.error) {
            return {
                error: 'error_while_checking',
                response: null,
            };
        }

        return {
            response: dateRes.response.hits.hits.map(fromES),
            error: null,
        };
    }

    /**
     * Find a date by its id
     *
     * @param dateId
     */
    async findOne(dateId: string): Promise<ServiceResponse<DateEntity>> {
        // Recover Event
        const dateRes = await this.search({
            id: dateId,
        });

        if (dateRes.error) {
            return {
                error: 'error_while_checking',
                response: null,
            };
        }

        if (dateRes.response.length === 0) {
            return {
                error: 'not_found',
                response: null,
            };
        }

        return {
            response: dateRes.response[0],
            error: null,
        };
    }

    /**
     * Remove category link from date
     *
     * @param dateId
     * @param category
     */
    public async removeCategory(dateId: string, category: CategoryEntity): Promise<CRUDResponse<DateEntity>> {
        const dateRes = await this.findOne(dateId);

        if (dateRes.error) {
            return {
                error: 'cannot_recover_date',
                response: null,
            };
        }

        const date = dateRes.response;

        if (date.categories.indexOf(category.id) === -1) {
            return {
                error: 'category_not_linked_to_date',
                response: null,
            };
        }

        if (category.dates.indexOf(dateId) === -1) {
            return {
                error: 'date_not_linked_to_category',
                response: null,
            };
        }

        const newCategoryList = date.categories.filter((categoryId: string): boolean => categoryId !== category.id);

        const dateUpdateRes = await this.update(
            {
                id: dateId,
            },
            {
                categories: newCategoryList,
            },
        );

        if (dateUpdateRes.error) {
            return {
                error: 'cannot_update_date',
                response: null,
            };
        }

        const categoryUpdateRes = await this.categoriesService.update(
            {
                id: category.id,
            },
            {
                dates: category.dates.filter((_dateId: string): boolean => _dateId !== date.id),
            },
        );

        if (categoryUpdateRes.error) {
            return {
                error: 'cannot_update_category',
                response: null,
            };
        }

        return {
            error: null,
            response: {
                ...date,
                categories: newCategoryList,
            },
        };
    }

    /**
     * Add category link to date
     *
     * @param dateId
     * @param category
     */
    public async addCategory(dateId: string, category: CategoryEntity): Promise<CRUDResponse<DateEntity>> {
        const dateRes = await this.findOne(dateId);

        if (dateRes.error) {
            return {
                error: 'cannot_recover_date',
                response: null,
            };
        }

        const date = dateRes.response;

        if (date.categories.indexOf(category.id) !== -1 || category.dates.indexOf(date.id) !== -1) {
            return {
                error: 'category_already_bound',
                response: null,
            };
        }

        if (date.group_id !== category.group_id) {
            return {
                error: 'incompatible_date_category',
                response: null,
            };
        }

        const dateUpdateRes = await this.update(
            {
                id: date.id,
            },
            {
                categories: [...date.categories, category.id],
            },
        );

        if (dateUpdateRes.error) {
            return {
                error: 'cannot_update_date',
                response: null,
            };
        }

        const categoryUpdateRes = await this.categoriesService.update(
            {
                id: category.id,
            },
            {
                dates: [...category.dates, date.id],
            },
        );

        if (categoryUpdateRes.error) {
            return {
                error: 'cannot_update_category',
                response: null,
            };
        }

        return {
            error: null,
            response: {
                ...date,
                categories: [...date.categories, category.id],
            },
        };
    }
}
