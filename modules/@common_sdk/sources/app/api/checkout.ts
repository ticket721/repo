import { AxiosResponse }                                   from 'axios';
import { CheckoutCartCommitStripeInputDto }                from '@app/server/controllers/checkout/dto/CheckoutCartCommitStripeInput.dto';
import { T721SDK }                                         from '../../index';
import { CheckoutCartCommitStripeResponseDto }             from '@app/server/controllers/checkout/dto/CheckoutCartCommitStripeResponse.dto';
import { CheckoutResolveCartWithPaymentIntentInputDto }    from '@app/server/controllers/checkout/dto/CheckoutResolveCartWithPaymentIntentInput.dto';
import { CheckoutResolveCartWithPaymentIntentResponseDto } from '@app/server/controllers/checkout/dto/CheckoutResolveCartWithPaymentIntentResponse.dto';

export async function checkoutCartCommitStripe(
    token: string,
    query: CheckoutCartCommitStripeInputDto,
): Promise<AxiosResponse<CheckoutCartCommitStripeResponseDto>> {

    const self: T721SDK = this;

    return self.post<CheckoutCartCommitStripeInputDto>('/checkout/cart/commit/stripe', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);

}

export async function checkoutResolveCartWithPaymentIntent(
    token: string,
    query: CheckoutResolveCartWithPaymentIntentInputDto
): Promise<AxiosResponse<CheckoutResolveCartWithPaymentIntentResponseDto>> {

    const self: T721SDK = this;

    return self.post<CheckoutResolveCartWithPaymentIntentInputDto>('/checkout/cart/resolve/paymentintent', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);

}

