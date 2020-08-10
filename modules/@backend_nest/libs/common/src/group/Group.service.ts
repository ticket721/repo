import { Injectable } from '@nestjs/common';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { EventEntity } from '@lib/common/events/entities/Event.entity';
import { DateEntity } from '@lib/common/dates/entities/Date.entity';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';
import { fromES } from '@lib/common/utils/fromES.helper';
import { EventsService } from '@lib/common/events/Events.service';
import { DatesService } from '@lib/common/dates/Dates.service';
import { CategoriesService } from '@lib/common/categories/Categories.service';

/**
 * Group Utilities
 */
@Injectable()
export class GroupService {
    /**
     * Dependency injection
     *
     * @param eventsService
     * @param datesService
     * @param categoriesService
     */
    constructor(
        private readonly eventsService: EventsService,
        private readonly datesService: DatesService,
        private readonly categoriesService: CategoriesService,
    ) {}

    /**
     * Internal utility to get the event controller from an event
     *
     * @param eventId
     * @param fields
     */
    private async resolveEventControllerFields<ResultType>(
        eventId: string,
        fields: string[],
    ): Promise<ServiceResponse<ResultType>> {
        const eventEntityRes = await this.eventsService.search({
            id: eventId,
        });

        if (eventEntityRes.error || eventEntityRes.response.length === 0) {
            return {
                error: 'cannot_resolve_event',
                response: null,
            };
        }

        const eventEntity: EventEntity = eventEntityRes.response[0];

        const res = [];

        for (const field of fields) {
            res.push(eventEntity[field]);
        }

        return {
            error: null,
            response: (res as any) as ResultType,
        };
    }

    /**
     * Internal utility to get the event controller from a date
     *
     * @param dateId
     * @param fields
     */
    private async resolveDateControllerFields<ResultType>(
        dateId: string,
        fields: string[],
    ): Promise<ServiceResponse<ResultType>> {
        const dateEntityRes = await this.datesService.search({
            id: dateId,
        });

        if (dateEntityRes.error || dateEntityRes.response.length === 0) {
            return {
                error: 'cannot_resolve_date',
                response: null,
            };
        }

        const dateEntity: DateEntity = dateEntityRes.response[0];

        return this.resolveEventControllerFields<ResultType>(dateEntity.parent_id, fields);
    }

    /**
     * Internal utility to get the event controller from a category
     *
     * @param category
     * @param fields
     */
    async getCategoryControllerFields<ResultType>(
        category: CategoryEntity,
        fields: string[],
    ): Promise<ServiceResponse<ResultType>> {
        switch (category.parent_type) {
            case 'date': {
                return this.resolveDateControllerFields<ResultType>(category.parent_id, fields);
            }
            case 'event': {
                return this.resolveEventControllerFields<ResultType>(category.parent_id, fields);
            }
        }
    }

    /**
     * Internal utility to get the event controller from a category
     *
     * @param groupId
     * @param categoryId
     * @param fields
     */
    async getGroupIDControllerFields<ResultType>(
        groupId: string,
        categoryId: string,
        fields: string[],
    ): Promise<ServiceResponse<ResultType>> {
        const categoriesQuery = await this.categoriesService.searchElastic({
            body: {
                query: {
                    bool: {
                        must: [
                            {
                                term: {
                                    group_id: groupId,
                                },
                            },
                            {
                                term: {
                                    id: categoryId,
                                },
                            },
                        ],
                    },
                },
            },
        });

        if (categoriesQuery.error || categoriesQuery.response.hits.total === 0) {
            return {
                error: categoriesQuery.error || 'no_categories_for_group_id',
                response: null,
            };
        }

        const category: CategoryEntity = fromES(categoriesQuery.response.hits.hits[0]);

        return this.getCategoryControllerFields<ResultType>(category, fields);
    }
}
