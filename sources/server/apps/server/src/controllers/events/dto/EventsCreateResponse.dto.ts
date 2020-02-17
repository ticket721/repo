import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';

/**
 * Data Model returned after events creation
 */
export class EventsCreateResponseDto {
    /**
     * Created ActionSet
     */
    actionset: ActionSetEntity;
}
