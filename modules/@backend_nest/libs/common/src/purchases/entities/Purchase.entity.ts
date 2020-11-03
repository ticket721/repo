import {
    Column,
    CreateDateColumn,
    Entity,
    GeneratedUUidColumn,
    UpdateDateColumn,
} from '@iaminfinity/express-cassandra';
import { ECAAG } from '@lib/common/utils/ECAAG.helper';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Product {
    @ApiProperty()
    @IsString()
    type: string;

    @ApiProperty()
    @IsString()
    id: string;

    @ApiProperty()
    @IsNumber()
    quantity: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    // tslint:disable-next-line:variable-name
    group_id: string;
}

export interface Payment {
    type: 'stripe' | 'none';
    id: string;
    client_id: string;
    status: 'waiting' | 'confirmed' | 'rejected';
}

export interface Fee {
    type: string;
    price: number;
}

@Entity<PurchaseEntity>({
    table_name: 'purchase',
    key: ['id'],
    es_index_mapping: {
        discover: '.*',
    },
} as any)
export class PurchaseEntity {
    /**
     * Entity Builder
     *
     * @param pe
     */
    constructor(pe?: PurchaseEntity) {
        if (pe) {
            this.id = pe.id ? pe.id.toString() : pe.id;
            this.owner = pe.owner ? pe.owner.toString() : pe.owner;
            this.fees = ECAAG(pe.fees);
            this.created_at = pe.created_at;
            this.updated_at = pe.updated_at;
            this.closed_at = pe.closed_at;
            this.checked_out_at = pe.checked_out_at;
            this.products = ECAAG(pe.products);
            this.currency = pe.currency;
            this.payment = pe.payment;
            this.payment_interface = pe.payment_interface;
            this.price = pe.price;
        }
    }

    /**
     * Unique id
     */
    @GeneratedUUidColumn()
    id: string;

    @Column({
        type: 'uuid',
    })
    owner: string;

    @Column({
        type: 'list',
        typeDef: '<frozen<fee>>',
    })
    fees: Fee[];

    @Column({
        type: 'list',
        typeDef: '<frozen<product>>',
    })
    products: Product[];

    @Column({
        type: 'frozen',
        typeDef: '<payment>',
    })
    payment: Payment;

    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    payment_interface: string;

    @Column({
        type: 'int',
    })
    price: number;

    @Column({
        type: 'text',
    })
    currency: string;

    @Column({
        type: 'timestamp',
    })
    // tslint:disable-next-line:variable-name
    checked_out_at: Date;

    /**
     * Purchase completed timestamp
     */
    @Column({
        type: 'timestamp',
    })
    // tslint:disable-next-line:variable-name
    closed_at: Date;

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
