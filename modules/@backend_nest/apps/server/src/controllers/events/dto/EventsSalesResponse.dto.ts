/**
 * Transaction format
 */
export interface Transaction {
    /**
     * Price paid
     */
    price: number;

    /**
     * Currency used
     */
    currency: string;

    /**
     * Date of transaction
     */
    date: Date;

    /**
     * Quantity of transactions
     */
    quantity: number;

    /**
     * Transaction status
     */
    status: 'waiting' | 'confirmed' | 'rejected';
}

/**
 * Data model returned when requesting sales info
 */
export class EventsSalesResponseDto {
    /**
     * List of attendees
     */
    transactions: Transaction[];
}
