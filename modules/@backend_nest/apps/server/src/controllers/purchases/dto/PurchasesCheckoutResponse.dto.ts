import { PurchaseEntity } from '@lib/common/purchases/entities/Purchase.entity';
import { PurchaseError } from '@lib/common/purchases/ProductChecker.base.service';
import { PaymentError } from '@lib/common/purchases/PaymentHandler.base.service';

/**
 * Data model returned when proceeding to checkout
 */
export class PurchasesCheckoutResponseDto {
    /**
     * Purchase entity
     */
    purchase?: PurchaseEntity;
    /**
     * Purchase errors
     */
    // tslint:disable-next-line:variable-name
    product_errors?: PurchaseError[];
    /**
     * Payment errors
     */
    // tslint:disable-next-line:variable-name
    payment_error?: PaymentError;
}
