import {
    Column,
    CreateDateColumn,
    Entity,
    GeneratedUUidColumn,
    UpdateDateColumn,
} from '@iaminfinity/express-cassandra';

export type ActionStatus = 'waiting' | 'in progress' | 'incomplete' | 'complete' | 'error';
export type ActionSetStatus =
    | 'input:waiting'
    | 'input:in progress'
    | 'input:error'
    | 'input:incomplete'
    | 'event:waiting'
    | 'event:in progress'
    | 'event:error'
    | 'event:incomplete'
    | 'complete'
    | 'error';
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
        discover: '^((?!actions).*)',
        properties: {
            actions: {
                type: 'nested',
                cql_collection: 'set',
            },
        },
    },
} as any)
export class ActionSetEntity {
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
    current_status: ActionSetStatus;

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

    /**
     * Dispatch timestamp
     */
    @Column({
        type: 'timestamp',
    })
    // tslint:disable-next-line:variable-name
    dispatched_at: Date;
}
