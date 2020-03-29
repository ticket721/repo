import { ActionEntity, ActionSetEntity, ActionSetStatus } from '@lib/common/actionsets/entities/ActionSet.entity';
import { Action } from '@lib/common/actionsets/helper/Action.class';

/**
 * Utility to edit and interpret the ActionSet
 */
export class ActionSet {
    /**
     * Internal ActionSetEntity
     */
    public entity: Partial<ActionSetEntity>;

    /**
     * Constructs and sets default entity values
     */
    constructor() {
        this.entity = {
            name: null,
            dispatched_at: new Date(Date.now()),
            actions: [],
            current_action: 0,
            current_status: null,
        };
    }

    /**
     * Load data from another ActionSetEntity
     *
     * @param entity
     */
    load(entity: Partial<ActionSetEntity>): ActionSet {
        this.entity = entity;
        return this;
    }

    /**
     * Recover id field
     */
    get id(): string {
        return this.entity.id;
    }

    /**
     * Set ActionSet ID
     *
     * @param id
     */
    setId(id: string): ActionSet {
        this.entity.id = id;

        return this;
    }

    /**
     * Recover actions field
     */
    get actions(): Action[] {
        return this.entity.actions.map((a: ActionEntity): Action => new Action().load(a));
    }

    /**
     * Recover current action
     */
    get action(): Action {
        return new Action().load(this.entity.actions[this.entity.current_action]);
    }

    /**
     * Set actions field
     *
     * @param actions
     */
    setActions(actions: Action[]): ActionSet {
        this.entity.actions = actions.map((a: Action): ActionEntity => a.raw);

        this.entity.current_action = 0;
        this.entity.current_status = `${
            this.entity.actions[this.entity.current_action].type
        }:in progress` as ActionSetStatus;

        return this;
    }

    /**
     * Recover current_action field
     */
    get current_action(): number {
        return this.entity.current_action;
    }

    /**
     * Set current_action field
     *
     * @param idx
     */
    setCurrentAction(idx: number): ActionSet {
        this.entity.current_action = idx;

        return this;
    }

    /**
     * Recover name field
     */
    get name(): string {
        return this.entity.name;
    }

    /**
     * Utility to set name field
     *
     * @param name
     */
    setName(name: string): ActionSet {
        this.entity.name = name;
        return this;
    }

    /**
     * Recover status field
     */
    get status(): string {
        return this.entity.current_status;
    }

    /**
     * Set ActionSet status
     *
     * @param status
     */
    setStatus(status: ActionSetStatus): ActionSet {
        this.entity.current_status = status;
        return this;
    }

    /**
     * Get only primary keys
     */
    getQuery(): Partial<ActionSetEntity> {
        return {
            id: this.entity.id,
        };
    }

    /**
     * Get ActionSetEntity body without primary keys
     */
    withoutQuery(): Partial<ActionSetEntity> {
        const { id, ...filtered }: any = this.entity;

        return filtered;
    }

    /**
     * Recover raw entity
     */
    get raw(): ActionSetEntity {
        return this.entity as ActionSetEntity;
    }

    /**
     * Sets current action status to complete and updates indexes
     */
    next(): ActionSet {
        this.entity.actions[this.entity.current_action].status = 'complete';
        this.entity.actions[this.entity.current_action].error = null;

        let newIdx = this.entity.current_action;

        while (newIdx < this.entity.actions.length) {
            if (this.entity.actions[newIdx].status !== 'complete') {
                break;
            }
            ++newIdx;
        }

        if (newIdx === this.entity.actions.length) {
            this.setStatus('complete');
        } else {
            this.entity.current_action = newIdx;
            this.entity.actions[this.entity.current_action].status = 'in progress';
            this.setStatus(`${this.action.type}:in progress` as ActionSetStatus);
        }

        return this;
    }
}
