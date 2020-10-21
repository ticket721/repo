import { UserDto } from '@lib/common/users/dto/User.dto';
import { Fee, Payment, PurchaseEntity } from '@lib/common/purchases/entities/Purchase.entity';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';

export interface PaymentError {
    reason: string;
}

export abstract class PaymentHandlerBaseService {
    abstract async onCheckout(
        user: UserDto,
        purchase: PurchaseEntity,
        payload: any,
        paymentInterfaceId: string,
        fees: Fee[],
    ): Promise<ServiceResponse<[Payment, Fee[], PaymentError]>>;
    abstract async cancel(payment: Payment, paymentInterfaceId: string): Promise<ServiceResponse<void>>;
    abstract async fetch(payment: Payment, paymentInterfaceId: string): Promise<ServiceResponse<Payment>>;
    // on checkout => returns Payment
    // update payment => returns Payment
}
