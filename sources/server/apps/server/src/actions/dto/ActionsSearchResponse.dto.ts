import {
    ActionEntity,
    ActionSetEntity,
} from '@lib/common/actionsets/entities/ActionSet.entity';

export class ActionsSearchResponseDto {
    actionsets: ActionSetEntity[];
}
