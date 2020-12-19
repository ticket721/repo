import { PaymentError, PaymentHandlerBaseService } from '@lib/common/purchases/PaymentHandler.base.service';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { Payment, PurchaseEntity, Fee } from '@lib/common/purchases/entities/Purchase.entity';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';

/**
 * Class to handle all payments that are free
 */
export class NonePaymentHandler implements PaymentHandlerBaseService {
    /**
     * On Checkout callback
     *
     * @param user
     * @param purchase
     * @param payload
     * @param paymentInterfaceId
     */
    async onCheckout(
        user: UserDto,
        purchase: PurchaseEntity,
        payload: any,
        paymentInterfaceId: string,
    ): Promise<ServiceResponse<[Payment, Fee[], PaymentError]>> {
        return {
            error: null,
            response: [
                {
                    id: null,
                    client_id: null,
                    type: 'none',
                    status: 'confirmed',
                },
                [],
                null,
            ],
        };
    }

    async finalPrice(payment: Payment, paymentInterfaceId): Promise<ServiceResponse<number>> {
        return {
            error: null,
            response: 0
        }
    }

    /**
     * On Checkout callback
     *
     * @param user
     * @param payment
     * @param paymentInterfaceId
     */
    async onComplete(user: UserDto, payment: Payment, paymentInterfaceId): Promise<ServiceResponse<void>> {
        return {
            error: null,
            response: null,
        };
    }

    /**
     * Fetch current payment status
     *
     * @param payment
     * @param paymentInterfaceId
     */
    async fetch(payment: Payment, paymentInterfaceId: string): Promise<ServiceResponse<Payment>> {
        return {
            error: null,
            response: {
                id: null,
                client_id: null,
                type: 'none',
                status: 'confirmed',
            },
        };
    }

    /**
     * Cancel current payment
     *
     * @param payment
     * @param paymentInterfaceId
     */
    async cancel(payment: Payment, paymentInterfaceId: string): Promise<ServiceResponse<void>> {
        return;
    }
}
