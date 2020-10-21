import { Fee, Product, PurchaseEntity } from '@lib/common/purchases/entities/Purchase.entity';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { UserDto } from '@lib/common/users/dto/User.dto';

export interface PurchaseError {
    reason: string;
    context: any;
}

export interface PurchasedItem {
    type: string;
    id: string;
}

export abstract class ProductCheckerServiceBase {
    abstract async check(
        user: UserDto,
        purchaseEntity: PurchaseEntity,
        productIdx: number,
    ): Promise<ServiceResponse<PurchaseError>>;

    abstract async add(
        user: UserDto,
        purchaseEntity: PurchaseEntity,
        product: Product,
    ): Promise<ServiceResponse<Partial<PurchaseEntity>>>;

    abstract async ok(
        user: UserDto,
        purchaseEntity: PurchaseEntity,
        productIdx: number,
    ): Promise<ServiceResponse<PurchasedItem[]>>;

    abstract async ko(
        user: UserDto,
        purchaseEntity: PurchaseEntity,
        productIdx: number,
    ): Promise<ServiceResponse<PurchaseError>>;

    abstract async interfaceId(groupId: string): Promise<ServiceResponse<string>>;

    abstract async fees(user: UserDto, purchaseEntity: PurchaseEntity, product: Product): Promise<ServiceResponse<Fee>>;

    // Check upon checkout
    // Check and actions upon validation
    // Check and actions upon failure
}
