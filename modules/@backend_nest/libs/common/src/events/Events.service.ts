import { CRUDExtension, CRUDResponse } from '@lib/common/crud/CRUDExtension.base';
import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';
import { EventsRepository } from '@lib/common/events/Events.repository';
import { EventEntity } from '@lib/common/events/entities/Event.entity';
import { DateEntity } from '@lib/common/dates/entities/Date.entity';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { DatesService } from '@lib/common/dates/Dates.service';
import { fromES } from '@lib/common/utils/fromES.helper';

/**
 * Service to CRUD EventEntities
 */
export class EventsService extends CRUDExtension<EventsRepository, EventEntity> {
    /**
     * Dependency injection
     *
     * @param eventsRepository
     * @param eventEntity
     * @param datesService
     */
    constructor(
        @InjectRepository(EventsRepository)
        eventsRepository: EventsRepository,
        @InjectModel(EventEntity)
        eventEntity: BaseModel<EventEntity>,
        private readonly datesService: DatesService,
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

    async findOneFromGroupId(groupId: string): Promise<ServiceResponse<EventEntity>> {
        // Recover Event
        const eventRes = await this.searchElastic({
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

        if (eventRes.error) {
            return {
                error: 'error_while_checking',
                response: null,
            };
        }

        if (eventRes.response.hits.total === 0) {
            return {
                error: 'not_found',
                response: null,
            };
        }

        return {
            response: fromES(eventRes.response.hits.hits[0]),
            error: null,
        };
    }

    async findOne(eventId: string): Promise<ServiceResponse<EventEntity>> {
        // Recover Event
        const eventRes = await this.search({
            id: eventId,
        });

        if (eventRes.error) {
            return {
                error: 'error_while_checking',
                response: null,
            };
        }

        if (eventRes.response.length === 0) {
            return {
                error: 'not_found',
                response: null,
            };
        }

        return {
            response: eventRes.response[0],
            error: null,
        };
    }

    async addDate(eventId: string, date: DateEntity): Promise<CRUDResponse<EventEntity>> {
        const eventRes = await this.findOne(eventId);

        if (eventRes.error) {
            return {
                error: 'cannot_recover_event',
                response: null,
            };
        }

        if (date.event !== null && date.event !== undefined) {
            return {
                error: 'date_already_in_an_event',
                response: null,
            };
        }

        const event: EventEntity = eventRes.response;

        if (date.group_id !== event.group_id) {
            return {
                error: 'incompatible_event_date',
                response: null,
            };
        }

        const eventUpdateRes = await this.update(
            {
                id: eventId,
            },
            {
                dates: [...event.dates, date.id],
            },
        );

        if (eventUpdateRes.error) {
            return {
                error: 'cannot_update_event',
                response: null,
            };
        }

        event.dates = [...event.dates, date.id];

        const dateUpdateRes = await this.datesService.update(
            {
                id: date.id,
            },
            {
                event: event.id,
            },
        );

        if (dateUpdateRes.error) {
            return {
                error: 'cannot_update_date',
                response: null,
            };
        }

        return {
            error: null,
            response: event,
        };
    }
}
