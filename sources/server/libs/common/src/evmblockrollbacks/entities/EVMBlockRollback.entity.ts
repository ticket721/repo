import {
    Column,
    CreateDateColumn,
    Entity,
    UpdateDateColumn,
} from '@iaminfinity/express-cassandra';
import { DryResponse } from '@lib/common/crud/CRUD.extension';

/**
 * Each processed block produces one Block Rollback
 */
@Entity<EVMBlockRollbackEntity>({
    table_name: 'evmblockrollback',
    key: ['block_number'],
    es_index_mapping: {
        discover: '.*',
    },
} as any)
export class EVMBlockRollbackEntity {
    /**
     * Block Number
     */
    @Column({
        type: 'int',
    })
    // tslint:disable-next-line:variable-name
    block_number: number;

    /**
     * Queries to run in order to rollback block
     */
    @Column({
        type: 'list',
        typeDef: '<frozen<dryresponse>>',
    })
    // tslint:disable-next-line:variable-name
    rollback_queries: DryResponse[];

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
