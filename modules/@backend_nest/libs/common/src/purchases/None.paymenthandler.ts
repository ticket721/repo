import { PaymentError, PaymentHandlerBaseService } from '@lib/common/purchases/PaymentHandler.base.service';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { Payment, PurchaseEntity, Fee } from '@lib/common/purchases/entities/Purchase.entity';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';

export class NonePaymentHandler implements PaymentHandlerBaseService {
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

    async onComplete(user: UserDto, payment: Payment, paymentInterfaceId): Promise<ServiceResponse<void>> {
        return {
            error: null,
            response: null,
        };
    }

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

    async cancel(payment: Payment, paymentInterfaceId: string): Promise<ServiceResponse<void>> {
        return;
    }
}
