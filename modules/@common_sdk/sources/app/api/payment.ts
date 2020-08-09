import { AxiosResponse }                                 from 'axios';
import { T721SDK }                                       from '../../index';
import { PaymentStripeFetchInterfaceResponseDto }        from '@app/server/controllers/payment/stripe/dto/PaymentStripeFetchInterfaceResponse.dto';
// tslint:disable-next-line:max-line-length
import { PaymentStripeCreateStripeInterfaceInputDto }    from '@app/server/controllers/payment/stripe/dto/PaymentStripeCreateStripeInterfaceInput.dto';
import { PaymentStripeCreateStripeInterfaceResponseDto } from '@app/server/controllers/payment/stripe/dto/PaymentStripeCreateStripeInterfaceResponse.dto';
import { PaymentStripeAddExternalAccountInputDto }       from '@app/server/controllers/payment/stripe/dto/PaymentStripeAddExternalAccountInput.dto';
// tslint:disable-next-line:max-line-length
import { PaymentStripeAddExternalAccountResponseDto }    from '@app/server/controllers/payment/stripe/dto/PaymentStripeAddExternalAccountResponse.dto';

export async function paymentStripeFetchInterface(
    token: string
): Promise<AxiosResponse<PaymentStripeFetchInterfaceResponseDto>> {

    const self: T721SDK = this;

    return self.get('/payment/stripe', {
        Authorization: `Bearer ${token}`
    });
}

export async function paymentStripeCreateInterface(
    token: string,
    query: PaymentStripeCreateStripeInterfaceInputDto
): Promise<AxiosResponse<PaymentStripeCreateStripeInterfaceResponseDto>> {

    const self: T721SDK = this;

    return self.post<PaymentStripeCreateStripeInterfaceInputDto>('/payment/stripe', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function paymentStripeAddExternalAccount(
    token: string,
    query: PaymentStripeAddExternalAccountInputDto
): Promise<AxiosResponse<PaymentStripeAddExternalAccountResponseDto>> {

    const self: T721SDK = this;

    return self.post<PaymentStripeAddExternalAccountInputDto>('/payment/stripe/external-account', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

