import {
    Column,
    CreateDateColumn,
    Entity,
    GeneratedUUidColumn,
    UpdateDateColumn,
    VersionColumn,
} from '@iaminfinity/express-cassandra';

export interface ActionEntity {
    status: string;
    name: string;
    data: string;
    type: 'input' | 'event';
    error: string;
}

@Entity<ActionSetEntity>({
    table_name: 'actionset',
    key: ['id'],
    es_index_mapping: {
        discover: '.*',
    },
} as any)
export class ActionSetEntity {
    /**
     * Unique identifier
     */
    @GeneratedUUidColumn()
    id: string;

    @Column({
        type: 'list',
        typeDef: '<frozen<action>>',
    })
    actions: ActionEntity[];

    @Column({
        type: 'uuid',
    })
    owner: string;

    @Column({
        type: 'int',
    })
    // tslint:disable-next-line:variable-name
    current_action: number;

    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    current_status: 'in progress' | 'complete' | 'error';

    @Column({
        type: 'text',
    })
    name: string;

    @CreateDateColumn()
    // tslint:disable-next-line:variable-name
    created_at: Date;

    @UpdateDateColumn()
    // tslint:disable-next-line:variable-name
    updated_at: Date;
}
