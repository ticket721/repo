import { ProductCheckerBaseServiceBase } from '@lib/common/purchases/ProductChecker.base.service';
import { PurchaseEntity } from '@lib/common/purchases/entities/Purchase.entity';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { UserDto } from '@lib/common/users/dto/User.dto';

export class CategoriesProduct implements ProductCheckerBaseServiceBase {
    async checkStatusHandle(
        user: UserDto,
        purchaseEntity: PurchaseEntity,
        productIdx: number,
        purchase: PurchaseEntity,
    ): Promise<ServiceResponse<PurchaseEntity>> {
        return {
            error: null,
            response: null,
        };
    }
}
