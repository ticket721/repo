import { Fee, Product, PurchaseEntity } from '@lib/common/purchases/entities/Purchase.entity';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { UserDto } from '@lib/common/users/dto/User.dto';

/**
 * Purchase error type
 */
export interface PurchaseError {
    /**
     * Reason
     */
    reason: string;

    /**
     * Additional context
     */
    context: any;
}

/**
 * Purchased item type
 */
export interface PurchasedItem {
    /**
     * Type of the product
     */
    type: string;

    /**
     * Final id
     */
    id: string;
}

/**
 * Item Summary
 */
export interface ItemSummary<ItemSummaryInfos> {
    /**
     * Type of the product
     */
    type: string;

    /**
     * summary data
     */
    data: ItemSummaryInfos;
}

/**
 * Base class for all product checker classes
 */
export abstract class ProductCheckerServiceBase {
    /**
     * Checks the current status of a given product
     *
     * @param user
     * @param purchaseEntity
     * @param productIdx
     */
    abstract async check(
        user: UserDto,
        purchaseEntity: PurchaseEntity,
        productIdx: number,
    ): Promise<ServiceResponse<PurchaseError>>;

    /**
     * Adds a product to the cart if all checks are succesful
     *
     * @param user
     * @param purchaseEntity
     * @param product
     */
    abstract async add(
        user: UserDto,
        purchaseEntity: PurchaseEntity,
        product: Product,
    ): Promise<ServiceResponse<Partial<PurchaseEntity>>>;

    /**
     * Callback called when purchase succeeds
     *
     * @param user
     * @param purchaseEntity
     * @param productIdx
     */
    abstract async ok(
        user: UserDto,
        purchaseEntity: PurchaseEntity,
        productIdx: number,
    ): Promise<ServiceResponse<PurchasedItem[]>>;

    /**
     * Callback called when purchase fails
     *
     * @param user
     * @param purchaseEntity
     * @param productIdx
     */
    abstract async ko(
        user: UserDto,
        purchaseEntity: PurchaseEntity,
        productIdx: number,
    ): Promise<ServiceResponse<PurchaseError>>;

    /**
     * Call to recover the interface ID to use
     *
     * @param groupId
     */
    abstract async interfaceId(groupId: string): Promise<ServiceResponse<string>>;

    /**
     * Call to recover the fees
     *
     * @param user
     * @param purchaseEntity
     * @param product
     */
    abstract async fees(user: UserDto, purchaseEntity: PurchaseEntity, product: Product): Promise<ServiceResponse<Fee>>;

    /**
     * Generate summary
     *
     * @param product
     * @param purchasedItems
     */
    abstract async generateSummary(
        product: Product,
        purchasedItems: PurchasedItem[],
    ): Promise<ServiceResponse<ItemSummary<any>[]>>;
}
