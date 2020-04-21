import { AxiosResponse }                                  from 'axios';
import { CheckoutCartCommitStripeInputDto }               from '@app/server/controllers/checkout/dto/CheckoutCartCommitStripeInput.dto';
import { T721SDK }                                        from '../../index';
import { CheckoutCartCommitStripeResponseDto }            from '@app/server/controllers/checkout/dto/CheckoutCartCommitStripeResponse.dto';

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

