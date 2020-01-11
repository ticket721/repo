import { ActionEntity } from '@lib/common/actionsets/entities/ActionSet.entity';

export class ActionsSearchResponseDto {
    id: string;

    actions: ActionEntity[];

    owner: string;

    // tslint:disable-next-line:variable-name
    current_action: number;

    // tslint:disable-next-line:variable-name
    current_status: 'in progress' | 'complete' | 'error';

    name: string;

    // tslint:disable-next-line:variable-name
    created_at: Date;

    // tslint:disable-next-line:variable-name
    updated_at: Date;
}
