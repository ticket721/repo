import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';

/**
 * Data model returns after action update
 */
export class ActionsUpdateResponseDto {
    /**
     * Updated actionset
     */
    actionset: ActionSetEntity;
}
