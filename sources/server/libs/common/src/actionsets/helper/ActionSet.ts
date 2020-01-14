import {
    ActionEntity,
    ActionSetEntity,
    ActionStatus,
} from '@lib/common/actionsets/entities/ActionSet.entity';
import { Action } from '@lib/common/actionsets/helper/Action';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { uuidEq } from '@ticket721sources/global';

export class ActionSet {
    public entity: Partial<ActionSetEntity> = {};

    load(entity: Partial<ActionSetEntity>): ActionSet {
        this.entity = entity;
        return this;
    }

    get id(): string {
        return this.entity.id;
    }

    setId(id: string): ActionSet {
        this.entity.id = id;

        return this;
    }

    get actions(): Action[] {
        return this.entity.actions.map(
            (a: ActionEntity): Action => new Action().load(a),
        );
    }

    get action(): Action {
        return new Action().load(
            this.entity.actions[this.entity.current_action],
        );
    }

    setActions(actions: Action[]): ActionSet {
        this.entity.actions = actions.map((a: Action): ActionEntity => a.raw);

        this.entity.current_action = 0;
        this.entity.current_status = 'in progress';

        return this;
    }

    get name(): string {
        return this.entity.name;
    }

    setName(name: string): ActionSet {
        this.entity.name = name;
        return this;
    }

    get owner(): string {
        return this.entity.owner;
    }

    setOwner(user: UserDto): ActionSet {
        this.entity.owner = user.id;

        return this;
    }

    isOwner(user: UserDto): boolean {
        return uuidEq(this.entity.owner, user.id);
    }

    get status(): string {
        return this.entity.current_status;
    }

    setStatus(status: ActionStatus): ActionSet {
        this.entity.current_status = status;
        return this;
    }

    getQuery(): Partial<ActionSetEntity> {
        return {
            id: this.entity.id,
        };
    }

    withoutQuery(): Partial<ActionSetEntity> {
        const { id, ...filtered }: any = this.entity;

        return filtered;
    }

    get raw(): ActionSetEntity {
        return this.entity as ActionSetEntity;
    }

    next(): ActionSet {
        this.entity.actions[this.entity.current_action].status = 'complete';

        if (this.entity.current_action === this.entity.actions.length - 1) {
            this.setStatus('complete');
        } else {
            this.entity.current_action += 1;
            this.entity.actions[this.entity.current_action].status =
                'in progress';

            this.setStatus('in progress');
        }

        return this;
    }
}
