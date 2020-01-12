import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';

/**
 * Response provided by the Actions Search
 */
export class ActionsSearchResponseDto {
    /**
     * Action Sets matching the query
     */
    actionsets: ActionSetEntity[];
}
