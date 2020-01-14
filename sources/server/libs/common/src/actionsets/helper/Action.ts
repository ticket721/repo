import { ActionEntity, ActionStatus, ActionType } from '@lib/common/actionsets/entities/ActionSet.entity';

export class Action {

    public entity: Partial<ActionEntity> = {
        error: null,
    };

    load(entity: Partial<ActionEntity>): Action {
        this.entity = entity;

        return this;
    }

    get raw(): ActionEntity {
        return this.entity as ActionEntity;
    }

    get data(): any {
        return JSON.parse(this.entity.data);
    }

    get status(): string {
        return this.entity.status;
    }

    get name(): string {
        return this.entity.name;
    }

    get error(): any {
        return this.entity.error ? JSON.parse(this.entity.error) : null;
    }

    get type(): ActionType {
        return this.entity.type;
    }

    setData<DataType>(data: DataType): Action {
        this.entity.data = JSON.stringify(data);

        return this;
    }

    setStatus(status: ActionStatus): Action {
        this.entity.status = status;

        return this;
    }

    setName(name: string): Action {
        this.entity.name = name;

        return this;
    }

    setError(error: any): Action {
        this.entity.error = JSON.stringify(error);

        return this;
    }

    setType(type: ActionType): Action {
        this.entity.type = type;

        return this;
    }

}
