import { CRUDExtension }                            from '@lib/common/crud/CRUDExtension.base';
import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';
import { EventsRepository }                         from '@lib/common/events/Events.repository';
import { EventEntity }                              from '@lib/common/events/entities/Event.entity';
import { DateEntity }                               from '@lib/common/dates/entities/Date.entity';
import { CategoryEntity }                           from '@lib/common/categories/entities/Category.entity';
import { ServiceResponse }                          from '@lib/common/utils/ServiceResponse.type';
import { CategoriesService }                        from '@lib/common/categories/Categories.service';

/**
 * Service to CRUD EventEntities
 */
export class EventsService extends CRUDExtension<EventsRepository, EventEntity> {
    /**
     * Dependency injection
     *
     * @param eventsRepository
     * @param eventEntity
     * @param categoriesService
     */
    constructor(
        @InjectRepository(EventsRepository)
        eventsRepository: EventsRepository,
        @InjectModel(EventEntity)
        eventEntity: BaseModel<EventEntity>,
        private readonly categoriesService: CategoriesService,
    ) {
        super(
            eventEntity,
            eventsRepository,
            /* istanbul ignore next */
            (e: EventEntity) => {
                return new eventEntity(e);
            },
            /* istanbul ignore next */
            (e: EventEntity) => {
                return new EventEntity(e);
            },
        );
    }

    /**
     * Creates event with provided pre-created dates and categories
     *
     * @param event
     * @param dates
     * @param categories
     */
    async createEventWithDatesAndCategories(
        event: Partial<EventEntity>,
        dates: Partial<DateEntity>[],
        categories: Partial<CategoryEntity>[],
    ): Promise<ServiceResponse<[EventEntity, CategoryEntity[]]>> {
        const storedCategories: CategoryEntity[] = [];

        event.categories = [];

        // 1. Create all categories
        for (const category of categories) {
            // 2. Check that they match current event's ID
            if (category.group_id !== event.group_id) {
                return {
                    error: 'invalid_category_group_id',
                    response: null,
                };
            }

            // 3. Trigger creation
            const categoryCreationRes = await this.categoriesService.create({
                ...category,
                reserved: 0,
            });

            // 4. Throw on creation error
            if (categoryCreationRes.error) {
                return {
                    error: categoryCreationRes.error,
                    response: null,
                };
            }

            // 5. Store resulting category
            storedCategories.push(categoryCreationRes.response);
            event.categories.push(categoryCreationRes.response.id);
        }

        event.dates = [];

        // 6. Check that dates match current event's ID
        for (const date of dates) {
            // 7. Throw if they don't
            if (date.group_id !== event.group_id) {
                return {
                    error: 'invalid_date_group_id',
                    response: null,
                };
            }

            // 8. Store resulting date
            event.dates.push(date.id);
        }

        // 9. Trigger event creation
        const createdEventRes = await this.create(event);

        if (createdEventRes.error) {
            return {
                error: createdEventRes.error,
                response: null,
            };
        }

        return {
            error: null,
            response: [createdEventRes.response, storedCategories],
        };
    }
}
