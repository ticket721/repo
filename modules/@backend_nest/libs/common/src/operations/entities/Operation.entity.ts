import {
    Column,
    CreateDateColumn,
    Entity,
    GeneratedUUidColumn,
    UpdateDateColumn,
} from '@iaminfinity/express-cassandra';
import { ECAAG } from '@lib/common/utils/ECAAG.helper';

@Entity<OperationEntity>({
    table_name: 'operation',
    key: ['id'],
    es_index_mapping: {
        discover: '.*',
    },
} as any)
export class OperationEntity {
    /**
     * Entity Builder
     *
     * @param op
     */
    constructor(op?: OperationEntity) {
        if (op) {
            this.id = op.id ? op.id.toString() : op.id;
            this.purchase_id = op.purchase_id ? op.purchase_id.toString() : op.purchase_id;
            this.client_id = op.client_id ? op.client_id.toString() : op.client_id;
            this.group_id = op.group_id;
            this.category_id = op.category_id ? op.category_id.toString() : op.category_id;
            this.ticket_ids = ECAAG(op.ticket_ids).map((ticketId: string) =>
                ticketId ? ticketId.toString() : ticketId,
            );
            this.type = op.type;
            this.status = op.status;
            this.quantity = op.quantity;
            this.fee = op.fee;
            this.price = op.price;
            this.created_at = op.created_at;
            this.updated_at = op.updated_at;
        }
    }

    /**
     * Unique id
     */
    @GeneratedUUidColumn('timeuuid')
    id: string;

    @Column({
        type: 'uuid',
    })
    // tslint:disable-next-line:variable-name
    purchase_id: string;

    @Column({
        type: 'uuid',
    })
    // tslint:disable-next-line:variable-name
    client_id: string;

    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    group_id: string;

    @Column({
        type: 'uuid',
    })
    // tslint:disable-next-line:variable-name
    category_id: string;

    @Column({
        type: 'list',
        typeDef: '<uuid>',
    })
    // tslint:disable-next-line:variable-name
    ticket_ids: string[];

    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    type: 'sell' | 'cancel';

    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    status: 'confirmed' | 'cancelled';

    @Column({
        type: 'int',
    })
    // tslint:disable-next-line:variable-name
    quantity: number;

    @Column({
        type: 'int',
    })
    // tslint:disable-next-line:variable-name
    fee: number;

    @Column({
        type: 'int',
    })
    // tslint:disable-next-line:variable-name
    price: number;

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
