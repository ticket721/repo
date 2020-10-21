import { Product } from '@lib/common/purchases/entities/Purchase.entity';
import { PurchaseError } from '@lib/common/purchases/ProductChecker.base.service';

export class PurchasesCloseResponseDto {
    products: Product[];
    errors: PurchaseError[];
}
