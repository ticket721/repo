import { PurchaseEntity } from '@lib/common/purchases/entities/Purchase.entity';
import { PurchaseError } from '@lib/common/purchases/Purchases.service';

export class PurchasesFetchResponseDto {
    cart: PurchaseEntity;
    errors: PurchaseError[];
}
