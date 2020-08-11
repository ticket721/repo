import { AxiosResponse }                                 from 'axios';
import { T721SDK }                                       from '../../index';
import { PaymentStripeFetchInterfaceResponseDto }        from '@app/server/controllers/payment/stripe/dto/PaymentStripeFetchInterfaceResponse.dto';
// tslint:disable-next-line:max-line-length
import { PaymentStripeCreateStripeInterfaceInputDto }    from '@app/server/controllers/payment/stripe/dto/PaymentStripeCreateStripeInterfaceInput.dto';
import { PaymentStripeCreateStripeInterfaceResponseDto } from '@app/server/controllers/payment/stripe/dto/PaymentStripeCreateStripeInterfaceResponse.dto';
import { PaymentStripeAddExternalAccountInputDto }       from '@app/server/controllers/payment/stripe/dto/PaymentStripeAddExternalAccountInput.dto';
// tslint:disable-next-line:max-line-length
import { PaymentStripeAddExternalAccountResponseDto }    from '@app/server/controllers/payment/stripe/dto/PaymentStripeAddExternalAccountResponse.dto';
import { PaymentStripeGenerateOnboardingUrlInputDto }    from '@app/server/controllers/payment/stripe/dto/PaymentStripeGenerateOnboardingUrlInput.dto';
import { PaymentStripeGenerateOnboardingUrlResponseDto } from '@app/server/controllers/payment/stripe/dto/PaymentStripeGenerateOnboardingUrlResponse.dto';
import { PaymentStripeGenerateUpdateUrlInputDto }        from '@app/server/controllers/payment/stripe/dto/PaymentStripeGenerateUpdateUrlInput.dto';
import { PaymentStripeGenerateUpdateUrlResponseDto }     from '@app/server/controllers/payment/stripe/dto/PaymentStripeGenerateUpdateUrlResponse.dto';

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

export async function paymentStripeGenerateOnboardingUrl(
    token: string,
    query: PaymentStripeGenerateOnboardingUrlInputDto
): Promise<AxiosResponse<PaymentStripeGenerateOnboardingUrlResponseDto>> {

    const self: T721SDK = this;

    return self.post<PaymentStripeGenerateOnboardingUrlInputDto>('/payment/stripe/onboarding', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function paymentStripeGenerateUpdateUrl(
    token: string,
    query: PaymentStripeGenerateUpdateUrlInputDto
): Promise<AxiosResponse<PaymentStripeGenerateUpdateUrlResponseDto>> {

    const self: T721SDK = this;

    return self.post<PaymentStripeGenerateUpdateUrlInputDto>('/payment/stripe/update', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}


