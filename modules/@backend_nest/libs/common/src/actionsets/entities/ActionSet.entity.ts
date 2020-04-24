import {
    Column,
    CreateDateColumn,
    Entity,
    GeneratedUUidColumn,
    UpdateDateColumn,
} from '@iaminfinity/express-cassandra';
import { Link } from '@lib/common/utils/Link.type';
import { ECAAG } from '@lib/common/utils/ECAAG.helper';

/**
 * Action Status
 */
export type ActionStatus = 'waiting' | 'in progress' | 'incomplete' | 'complete' | 'error';
/**
 * ActionSet Status
 */
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
/**
 * Action Types
 */
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

    /**
     * True if user cannot update this step
     */
    private: boolean;
}

/**
 * Entity of an Action Set, containing multiple Actions
 */
@Entity<ActionSetEntity>({
    table_name: 'actionset',
    key: ['id'],
    es_index_mapping: {
        discover: '^((?!links).*)',
        properties: {
            links: {
                type: 'nested',
                cql_collection: 'list',
                properties: {
                    id: {
                        cql_collection: 'singleton',
                        type: 'keyword',
                    },
                    type: {
                        cql_collection: 'singleton',
                        type: 'text',
                    },
                },
            },
        },
    },
} as any)
export class ActionSetEntity {
    /**
     * Entity Builder
     *
     * @param as
     */
    constructor(as?: Partial<ActionSetEntity>) {
        if (as) {
            this.id = as.id ? as.id.toString() : as.id;
            this.actions = ECAAG(as.actions);
            this.links = ECAAG(as.links);
            this.current_action = as.current_action;
            this.current_status = as.current_status;
            this.name = as.name;
            this.created_at = as.created_at;
            this.updated_at = as.updated_at;
            this.dispatched_at = as.dispatched_at;
        }
    }

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
     * Links of actionsets
     */
    @Column({
        type: 'list',
        typeDef: '<frozen<link>>',
    })
    links: Link[];

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
