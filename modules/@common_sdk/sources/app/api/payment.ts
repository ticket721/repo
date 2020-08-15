import { AxiosResponse } from 'axios';
import { T721SDK } from '../../index';
import { PaymentStripeFetchInterfaceResponseDto } from '@app/server/controllers/payment/stripe/dto/PaymentStripeFetchInterfaceResponse.dto';
// tslint:disable-next-line:max-line-length
import { PaymentStripeAddExternalAccountInputDto } from '@app/server/controllers/payment/stripe/dto/PaymentStripeAddExternalAccountInput.dto';
// tslint:disable-next-line:max-line-length
import { PaymentStripeAddExternalAccountResponseDto } from '@app/server/controllers/payment/stripe/dto/PaymentStripeAddExternalAccountResponse.dto';
import { PaymentStripeGenerateOnboardingUrlInputDto } from '@app/server/controllers/payment/stripe/dto/PaymentStripeGenerateOnboardingUrlInput.dto';
import { PaymentStripeGenerateOnboardingUrlResponseDto } from '@app/server/controllers/payment/stripe/dto/PaymentStripeGenerateOnboardingUrlResponse.dto';
import { PaymentStripeGenerateUpdateUrlInputDto } from '@app/server/controllers/payment/stripe/dto/PaymentStripeGenerateUpdateUrlInput.dto';
import { PaymentStripeGenerateUpdateUrlResponseDto } from '@app/server/controllers/payment/stripe/dto/PaymentStripeGenerateUpdateUrlResponse.dto';
import { PaymentStripeRemoveExternalAccountInputDto } from '@app/server/controllers/payment/stripe/dto/PaymentStripeRemoveExternalAccountInput.dto';
import { PaymentStripeRemoveExternalAccountResponseDto } from '@app/server/controllers/payment/stripe/dto/PaymentStripeRemoveExternalAccountResponse.dto';
import { PaymentStripeSetDefaultExternalAccountInputDto } from '@app/server/controllers/payment/stripe/dto/PaymentStripeSetDefaultExternalAccountInput.dto';
import { PaymentStripeSetDefaultExternalAccountResponseDto } from '@app/server/controllers/payment/stripe/dto/PaymentStripeSetDefaultExternalAccountResponse.dto';
import { PaymentStripeFetchBalanceResponseDto } from '@app/server/controllers/payment/stripe/dto/PaymentStripeFetchBalanceResponse.dto';
import { PaymentStripeCreateInterfaceResponseDto } from '@app/server/controllers/payment/stripe/dto/PaymentStripeCreateInterfaceResponse.dto';
import { PaymentStripeCreateConnectAccountInputDto } from '@app/server/controllers/payment/stripe/dto/PaymentStripeCreateConnectAccountInput.dto';
import { PaymentStripeCreateConnectAccountResponseDto } from '@app/server/controllers/payment/stripe/dto/PaymentStripeCreateConnectAccountResponse.dto';

export async function paymentStripeFetchInterface(
    token: string
): Promise<AxiosResponse<PaymentStripeFetchInterfaceResponseDto>> {
    const self: T721SDK = this;

    return self.get('/payment/stripe', {
        Authorization: `Bearer ${token}`
    });
}

export async function paymentStripeCreateInterface(
    token: string
): Promise<AxiosResponse<PaymentStripeCreateInterfaceResponseDto>> {
    const self: T721SDK = this;

    return self.post('/payment/stripe', {
        Authorization: `Bearer ${token}`,
    }, null);
}

export async function paymentStripeFetchBalance(
    token: string
): Promise<AxiosResponse<PaymentStripeFetchBalanceResponseDto>> {
    const self: T721SDK = this;

    return self.get(
        '/payment/stripe/connect-account/balance',
        {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    );
}

export async function paymentStripeCreateConnectAccount(
    token: string,
    query: PaymentStripeCreateConnectAccountInputDto
): Promise<AxiosResponse<PaymentStripeCreateConnectAccountResponseDto>> {
    const self: T721SDK = this;

    return self.post<PaymentStripeCreateConnectAccountInputDto>(
        '/payment/stripe/connect-account',
        {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        query
    );
}

export async function paymentStripeAddExternalAccount(
    token: string,
    query: PaymentStripeAddExternalAccountInputDto
): Promise<AxiosResponse<PaymentStripeAddExternalAccountResponseDto>> {
    const self: T721SDK = this;

    return self.post<PaymentStripeAddExternalAccountInputDto>(
        '/payment/stripe/connect-account/external-account',
        {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        query
    );
}

export async function paymentStripeRemoveExternalAccount(
    token: string,
    query: PaymentStripeRemoveExternalAccountInputDto
): Promise<AxiosResponse<PaymentStripeRemoveExternalAccountResponseDto>> {
    const self: T721SDK = this;

    return self.delete<PaymentStripeRemoveExternalAccountInputDto>(
        '/payment/stripe/connect-account/external-account',
        {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        query
    );
}

export async function paymentStripeSetDefaultExternalAccount(
    token: string,
    query: PaymentStripeSetDefaultExternalAccountInputDto
): Promise<AxiosResponse<PaymentStripeSetDefaultExternalAccountResponseDto>> {
    const self: T721SDK = this;

    return self.put<PaymentStripeSetDefaultExternalAccountInputDto>(
        '/payment/stripe/connect-account/external-account/default',
        {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        query
    );
}

export async function paymentStripeGenerateOnboardingUrl(
    token: string,
    query: PaymentStripeGenerateOnboardingUrlInputDto
): Promise<AxiosResponse<PaymentStripeGenerateOnboardingUrlResponseDto>> {
    const self: T721SDK = this;

    return self.post<PaymentStripeGenerateOnboardingUrlInputDto>(
        '/payment/stripe/connect-account/onboarding',
        {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        query
    );
}

export async function paymentStripeGenerateUpdateUrl(
    token: string,
    query: PaymentStripeGenerateUpdateUrlInputDto
): Promise<AxiosResponse<PaymentStripeGenerateUpdateUrlResponseDto>> {
    const self: T721SDK = this;

    return self.post<PaymentStripeGenerateUpdateUrlInputDto>(
        '/payment/stripe/connect-account/update',
        {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        query
    );
}
