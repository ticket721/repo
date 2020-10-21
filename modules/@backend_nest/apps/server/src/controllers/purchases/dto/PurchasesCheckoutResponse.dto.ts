import { PurchaseEntity } from '@lib/common/purchases/entities/Purchase.entity';
import { PurchaseError } from '@lib/common/purchases/ProductChecker.base.service';
import { PaymentError } from '@lib/common/purchases/PaymentHandler.base.service';

export class PurchasesCheckoutResponseDto {
    purchase?: PurchaseEntity;
    // tslint:disable-next-line:variable-name
    product_errors?: PurchaseError[];
    // tslint:disable-next-line:variable-name
    payment_error?: PaymentError;
}
