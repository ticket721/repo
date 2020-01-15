import {
    ActionEntity,
    ActionStatus,
    ActionType,
} from '@lib/common/actionsets/entities/ActionSet.entity';

/**
 * Utility to edit and interpret the ActionSet
 */
export class Action {
    /**
     * Internal ActionSetEntity
     */
    public entity: Partial<ActionEntity>;

    /**
     * Constructs and sets default entity values
     */
    constructor() {
        this.entity = {
            type: null,
            name: null,
            data: null,
            error: null,
            status: null,
        };
    }

    /**
     * Load data from another ActionEntity
     *
     * @param entity
     */
    load(entity: Partial<ActionEntity>): Action {
        this.entity = entity;

        return this;
    }

    /**
     * Recover raw entity
     */
    get raw(): ActionEntity {
        return this.entity as ActionEntity;
    }

    /**
     * Recover data field
     */
    get data(): any {
        return JSON.parse(this.entity.data);
    }

    /**
     * Recover status field
     */
    get status(): string {
        return this.entity.status;
    }

    /**
     * Recover name field
     */
    get name(): string {
        return this.entity.name;
    }

    /**
     * Recover error field
     */
    get error(): any {
        return this.entity.error ? JSON.parse(this.entity.error) : null;
    }

    /**
     * Recover type field
     */
    get type(): ActionType {
        return this.entity.type;
    }

    /**
     * Set data field
     *
     * @param data
     */
    setData<DataType>(data: DataType): Action {
        this.entity.data = JSON.stringify(data);

        return this;
    }

    /**
     * Set status field
     *
     * @param status
     */
    setStatus(status: ActionStatus): Action {
        this.entity.status = status;

        return this;
    }

    /**
     * Set name field
     *
     * @param name
     */
    setName(name: string): Action {
        this.entity.name = name;

        return this;
    }

    /**
     * Set error field
     *
     * @param error
     */
    setError(error: any): Action {
        this.entity.error = JSON.stringify(error);

        return this;
    }

    /**
     * Set type field
     *
     * @param type
     */
    setType(type: ActionType): Action {
        this.entity.type = type;

        return this;
    }
}
