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

/**
 * Product type
 */
export class Product {
    /**
     * Product type
     */
    @ApiProperty()
    @IsString()
    type: string;

    /**
     * Product ID
     */
    @ApiProperty()
    @IsString()
    id: string;

    /**
     * Product quantity
     */
    @ApiProperty()
    @IsNumber()
    quantity: number;

    /**
     * Product Group ID
     */
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
        // tslint:disable-next-line:variable-name
    group_id: string;
}

/**
 * Payment details
 */
export interface Payment {
    /**
     * payment method type
     */
    type: 'stripe' | 'none';

    /**
     * Payment method id
     */
    id: string;

    /**
     * Client ID
     */
    client_id: string;

    /**
     * Payment status
     */
    status: 'waiting' | 'confirmed' | 'rejected';
}

/**
 * Fee type
 */
export interface Fee {
    /**
     * Name of the fee
     */
    type: string;

    /**
     * Amount of the fee
     */
    price: number;
}

/**
 * Purchase entity
 */
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
            this.final_price = pe.final_price;
            this.close_guard = pe.close_guard;
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

    /**
     * Prevent multiple close calls in short timelapses
     */
    @Column({
        type: 'timestamp',
    })
        // tslint:disable-next-line:variable-name
    close_guard: Date;

    /**
     * Prevent multiple close calls in short timelapses
     */
    @Column({
        type: 'int',
    })
        // tslint:disable-next-line:variable-name
    final_price: number;

    /**
     * Owner
     */
    @Column({
        type: 'uuid',
    })
    owner: string;

    /**
     * Fees
     */
    @Column({
        type: 'list',
        typeDef: '<frozen<fee>>',
    })
    fees: Fee[];

    /**
     * Products
     */
    @Column({
        type: 'list',
        typeDef: '<frozen<product>>',
    })
    products: Product[];

    /**
     * Payment
     */
    @Column({
        type: 'frozen',
        typeDef: '<payment>',
    })
    payment: Payment;

    /**
     * Payment Interface
     */
    @Column({
        type: 'text',
    })
        // tslint:disable-next-line:variable-name
    payment_interface: string;

    /**
     * Price
     */
    @Column({
        type: 'int',
    })
    price: number;

    /**
     * Currency
     */
    @Column({
        type: 'text',
    })
    currency: string;

    /**
     * Checked out timestamp
     */
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
