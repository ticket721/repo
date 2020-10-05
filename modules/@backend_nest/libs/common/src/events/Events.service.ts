import { CRUDExtension } from '@lib/common/crud/CRUDExtension.base';
import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';
import { EventsRepository } from '@lib/common/events/Events.repository';
import { EventEntity } from '@lib/common/events/entities/Event.entity';

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
}
