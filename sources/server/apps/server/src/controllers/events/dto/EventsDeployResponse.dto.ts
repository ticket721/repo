import { EventEntity } from '@lib/common/events/entities/Event.entity';

/**
 * Data Model returned after Event Deployment request
 */
export class EventsDeployResponseDto {
    /**
     * Updated Event entity
     */
    event: EventEntity;
}
