import {
    Column,
    CreateDateColumn,
    Entity,
    GeneratedUUidColumn,
    UpdateDateColumn,
} from '@iaminfinity/express-cassandra';

export type ActionStatus = 'waiting' | 'in progress' | 'complete' | 'error';
export type ActionType = 'input' | 'event';

/**
 * Specific Action model
 */
export interface ActionEntity {
    /**
     * Status of the action
     */
    status: ActionStatus;

    /**
     * Name of the action
     */
    name: string;

    /**
     * Stored data of the action
     */
    data: string;

    /**
     * Type of action
     */
    type: ActionType;

    /**
     * Non-null if error happened
     */
    error: string;
}

/**
 * Entity of an Action Set, containing multiple Actions
 */
@Entity<ActionSetEntity>({
    table_name: 'actionset',
    key: ['id'],
    es_index_mapping: {
        discover: '.*',
    },
} as any)
export class ActionSetEntity {
    // static create(name: string, owner: UserEntity): ActionSetEntity {
    //     const ase: ActionSetEntity = new ActionSetEntity();
    //     ase.name = name;
    //     ase.owner = owner.id;
    //     ase.current_action = 0;
    //     ase.actions = [];

    //     return ase;
    // }

    // addAction(name: string, type: ActionType, data: any = {}): ActionSetEntity {
    //     this.actions.push({
    //         status: 'waiting',
    //         name,
    //         type,
    //         data: JSON.stringify(data),
    //         error: null,
    //     });

    //     if (this.actions.length === 1) {
    //         this.current_status = `waiting ${this.actions[0].type}` as any;
    //     }

    //     return this;
    // }

    // setActionData(data: any): ActionSetEntity {
    //     this.actions[this.current_action].data = JSON.stringify(data);

    //     return this;
    // }

    // getActionData(): any {
    //     return this.actions[this.current_action].data;
    // }

    // next(): ActionSetEntity {
    //     this.actions[this.current_action].status = 'complete';

    //     if (this.current_action === this.actions.length - 1) {
    //         this.current_status = 'complete';
    //     } else {
    //         this.current_action += 1;
    //         this.actions[this.current_action].status = 'in progress';
    //     }

    //     return this;
    // }

    // setActionError(index: number, error: string): ActionSetEntity {
    //     this.actions[index].status = 'error';
    //     this.actions[index].error = error;
    //     this.current_status = 'error';

    //     return this;
    // };

    /**
     * Unique identifier
     */
    @GeneratedUUidColumn()
    id: string;

    /**
     * Action container
     */
    @Column({
        type: 'list',
        typeDef: '<frozen<action>>',
    })
    actions: ActionEntity[];

    /**
     * Owner of the action set
     */
    @Column({
        type: 'uuid',
    })
    owner: string;

    /**
     * Current action index
     */
    @Column({
        type: 'int',
    })
    // tslint:disable-next-line:variable-name
    current_action: number;

    /**
     * Current overall status
     */
    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    current_status: 'waiting input' | 'waiting event' | 'complete' | 'error';

    /**
     * Name of the action set
     */
    @Column({
        type: 'text',
    })
    name: string;

    /**
     * Creation timestamp
     */
    @CreateDateColumn()
    // tslint:disable-next-line:variable-name
    created_at: Date;

    /**
     * Update timestamp
     */
    @UpdateDateColumn()
    // tslint:disable-next-line:variable-name
    updated_at: Date;
}
