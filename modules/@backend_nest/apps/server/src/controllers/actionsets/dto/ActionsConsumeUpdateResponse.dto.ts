import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';

/**
 * Data model returns after action consumed update
 */
export class ActionsConsumeUpdateResponseDto {
    /**
     * Updated actionset
     */
    actionset: ActionSetEntity;
}
