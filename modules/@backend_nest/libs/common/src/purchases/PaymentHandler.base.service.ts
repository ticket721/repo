import { UserDto } from '@lib/common/users/dto/User.dto';
import { Fee, Payment, PurchaseEntity } from '@lib/common/purchases/entities/Purchase.entity';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';

/**
 * Payment error type
 */
export interface PaymentError {
    /**
     * Reason
     */
    reason: string;
}

/**
 * Base class for payment handlers
 */
export abstract class PaymentHandlerBaseService {
    /**
     * Called upon checkout
     *
     * @param user
     * @param purchase
     * @param payload
     * @param paymentInterfaceId
     * @param fees
     */
    abstract async onCheckout(
        user: UserDto,
        purchase: PurchaseEntity,
        payload: any,
        paymentInterfaceId: string,
        fees: Fee[],
    ): Promise<ServiceResponse<[Payment, Fee[], PaymentError]>>;

    /**
     * Called upon completion
     *
     * @param user
     * @param payment
     * @param paymentInterfaceId
     */
    abstract async onComplete(
        user: UserDto,
        payment: Payment,
        paymentInterfaceId: string,
    ): Promise<ServiceResponse<void>>;

    /**
     * Called when cancelled
     *
     * @param payment
     * @param paymentInterfaceId
     */
    abstract async cancel(payment: Payment, paymentInterfaceId: string): Promise<ServiceResponse<void>>;

    /**
     * Fetch a payment update
     *
     * @param payment
     * @param paymentInterfaceId
     */
    abstract async fetch(payment: Payment, paymentInterfaceId: string): Promise<ServiceResponse<Payment>>;
}
