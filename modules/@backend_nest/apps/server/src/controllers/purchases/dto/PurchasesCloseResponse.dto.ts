import { Product } from '@lib/common/purchases/entities/Purchase.entity';
import { PurchaseError } from '@lib/common/purchases/ProductChecker.base.service';

/**
 * Data model returned when closing a purchase
 */
export class PurchasesCloseResponseDto {
    /**
     * List of acquired products
     */
    products: Product[];
    /**
     * List of possible errors
     */
    errors: PurchaseError[];
}
