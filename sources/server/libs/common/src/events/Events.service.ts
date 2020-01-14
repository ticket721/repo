import { CRUDExtension }    from '@lib/common/crud/CRUD.extension';
import {
    BaseModel,
    InjectModel,
    InjectRepository,
}                           from '@iaminfinity/express-cassandra';
import { EventsRepository } from '@lib/common/events/Events.repository';
import { EventEntity }      from '@lib/common/events/entities/Event.entity';

/**
 * Service to CRUD EventEntities
 */
export class EventsService extends CRUDExtension<EventsRepository, EventEntity> {
    /**
     * Dependency injection
     *
     * @param eventsRepository
     * @param eventEntity
     */
    constructor(
        @InjectRepository(EventsRepository)
        eventsRepository: EventsRepository,
        @InjectModel(EventEntity)
        eventEntity: BaseModel<EventEntity>,
    ) {
        super(eventEntity, eventsRepository);
    }
}
