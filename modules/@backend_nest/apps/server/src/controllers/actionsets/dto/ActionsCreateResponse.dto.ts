import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';

/**
 * Date model returned when creation an action set
 */
export class ActionsCreateResponseDto {
    /**
     * Created action set
     */
    actionset: ActionSetEntity;
}
