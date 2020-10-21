import { PurchaseEntity } from '@lib/common/purchases/entities/Purchase.entity';
import { PurchaseError } from '@lib/common/purchases/ProductChecker.base.service';

export class PurchasesFetchResponseDto {
    cart: PurchaseEntity;
    errors: PurchaseError[];
}
