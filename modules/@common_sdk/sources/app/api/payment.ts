import { AxiosResponse }                                     from 'axios';
import { T721SDK }                                           from '../../index';
// tslint:disable-next-line:max-line-length
import { PaymentStripeFetchInterfaceResponseDto }            from '@app/server/controllers/payment/stripe/dto/PaymentStripeFetchInterfaceResponse.dto';
// tslint:disable-next-line:max-line-length
import { PaymentStripeAddExternalAccountInputDto }           from '@app/server/controllers/payment/stripe/dto/PaymentStripeAddExternalAccountInput.dto';
// tslint:disable-next-line:max-line-length
import { PaymentStripeAddExternalAccountResponseDto }        from '@app/server/controllers/payment/stripe/dto/PaymentStripeAddExternalAccountResponse.dto';
// tslint:disable-next-line:max-line-length
import { PaymentStripeGenerateOnboardingUrlInputDto }        from '@app/server/controllers/payment/stripe/dto/PaymentStripeGenerateOnboardingUrlInput.dto';
// tslint:disable-next-line:max-line-length
import { PaymentStripeGenerateOnboardingUrlResponseDto }     from '@app/server/controllers/payment/stripe/dto/PaymentStripeGenerateOnboardingUrlResponse.dto';
// tslint:disable-next-line:max-line-length
import { PaymentStripeGenerateUpdateUrlInputDto }            from '@app/server/controllers/payment/stripe/dto/PaymentStripeGenerateUpdateUrlInput.dto';
// tslint:disable-next-line:max-line-length
import { PaymentStripeGenerateUpdateUrlResponseDto }         from '@app/server/controllers/payment/stripe/dto/PaymentStripeGenerateUpdateUrlResponse.dto';
// tslint:disable-next-line:max-line-length
import { PaymentStripeRemoveExternalAccountInputDto }        from '@app/server/controllers/payment/stripe/dto/PaymentStripeRemoveExternalAccountInput.dto';
// tslint:disable-next-line:max-line-length
import { PaymentStripeRemoveExternalAccountResponseDto }     from '@app/server/controllers/payment/stripe/dto/PaymentStripeRemoveExternalAccountResponse.dto';
// tslint:disable-next-line:max-line-length
import { PaymentStripeSetDefaultExternalAccountInputDto }    from '@app/server/controllers/payment/stripe/dto/PaymentStripeSetDefaultExternalAccountInput.dto';
// tslint:disable-next-line:max-line-length
import { PaymentStripeSetDefaultExternalAccountResponseDto } from '@app/server/controllers/payment/stripe/dto/PaymentStripeSetDefaultExternalAccountResponse.dto';
// tslint:disable-next-line:max-line-length
import { PaymentStripeFetchBalanceResponseDto }              from '@app/server/controllers/payment/stripe/dto/PaymentStripeFetchBalanceResponse.dto';
// tslint:disable-next-line:max-line-length
import { PaymentStripeCreateInterfaceResponseDto }           from '@app/server/controllers/payment/stripe/dto/PaymentStripeCreateInterfaceResponse.dto';
// tslint:disable-next-line:max-line-length
import { PaymentStripeCreateConnectAccountInputDto }         from '@app/server/controllers/payment/stripe/dto/PaymentStripeCreateConnectAccountInput.dto';
// tslint:disable-next-line:max-line-length
import { PaymentStripeCreateConnectAccountResponseDto }      from '@app/server/controllers/payment/stripe/dto/PaymentStripeCreateConnectAccountResponse.dto';
// tslint:disable-next-line:max-line-length
import { PaymentStripePayoutInputDto }                       from '@app/server/controllers/payment/stripe/dto/PaymentStripePayoutInput.dto';
// tslint:disable-next-line:max-line-length
import { PaymentStripePayoutResponseDto }                    from '@app/server/controllers/payment/stripe/dto/PaymentStripePayoutResponse.dto';
// tslint:disable-next-line:max-line-length
import { PaymentStripeTransactionsInputDto }                 from '@app/server/controllers/payment/stripe/dto/PaymentStripeTransactionsInput.dto';
// tslint:disable-next-line:max-line-length
import { PaymentStripeTransactionsResponseDto }              from '@app/server/controllers/payment/stripe/dto/PaymentStripeTransactionsResponse.dto';

export async function paymentStripeFetchInterface(
    token: string,
): Promise<AxiosResponse<PaymentStripeFetchInterfaceResponseDto>> {
    const self: T721SDK = this;

    return self.get('/payment/stripe', {
        Authorization: `Bearer ${token}`,
    });
}

export async function paymentStripeCreateInterface(
    token: string,
): Promise<AxiosResponse<PaymentStripeCreateInterfaceResponseDto>> {
    const self: T721SDK = this;

    return self.post('/payment/stripe', {
        Authorization: `Bearer ${token}`,
    }, null);
}

export async function paymentStripeFetchBalance(
    token: string,
): Promise<AxiosResponse<PaymentStripeFetchBalanceResponseDto>> {
    const self: T721SDK = this;

    return self.get(
        '/payment/stripe/connect-account/balance',
        {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    );
}

export async function paymentStripeCreateConnectAccount(
    token: string,
    query: PaymentStripeCreateConnectAccountInputDto,
): Promise<AxiosResponse<PaymentStripeCreateConnectAccountResponseDto>> {
    const self: T721SDK = this;

    return self.post<PaymentStripeCreateConnectAccountInputDto>(
        '/payment/stripe/connect-account',
        {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        query,
    );
}

export async function paymentStripeAddExternalAccount(
    token: string,
    query: PaymentStripeAddExternalAccountInputDto,
): Promise<AxiosResponse<PaymentStripeAddExternalAccountResponseDto>> {
    const self: T721SDK = this;

    return self.post<PaymentStripeAddExternalAccountInputDto>(
        '/payment/stripe/connect-account/external-account',
        {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        query,
    );
}

export async function paymentStripeRemoveExternalAccount(
    token: string,
    query: PaymentStripeRemoveExternalAccountInputDto,
): Promise<AxiosResponse<PaymentStripeRemoveExternalAccountResponseDto>> {
    const self: T721SDK = this;

    return self.delete<PaymentStripeRemoveExternalAccountInputDto>(
        '/payment/stripe/connect-account/external-account',
        {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        query,
    );
}

export async function paymentStripeSetDefaultExternalAccount(
    token: string,
    query: PaymentStripeSetDefaultExternalAccountInputDto,
): Promise<AxiosResponse<PaymentStripeSetDefaultExternalAccountResponseDto>> {
    const self: T721SDK = this;

    return self.put<PaymentStripeSetDefaultExternalAccountInputDto>(
        '/payment/stripe/connect-account/external-account/default',
        {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        query,
    );
}

export async function paymentStripeGenerateOnboardingUrl(
    token: string,
    query: PaymentStripeGenerateOnboardingUrlInputDto,
): Promise<AxiosResponse<PaymentStripeGenerateOnboardingUrlResponseDto>> {
    const self: T721SDK = this;

    return self.post<PaymentStripeGenerateOnboardingUrlInputDto>(
        '/payment/stripe/connect-account/onboarding',
        {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        query,
    );
}

export async function paymentStripeGenerateUpdateUrl(
    token: string,
    query: PaymentStripeGenerateUpdateUrlInputDto,
): Promise<AxiosResponse<PaymentStripeGenerateUpdateUrlResponseDto>> {
    const self: T721SDK = this;

    return self.post<PaymentStripeGenerateUpdateUrlInputDto>(
        '/payment/stripe/connect-account/update',
        {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        query,
    );
}

export async function paymentStripePayout(
    token: string,
    query: PaymentStripePayoutInputDto,
): Promise<AxiosResponse<PaymentStripePayoutResponseDto>> {
    const self: T721SDK = this;

    return self.post<PaymentStripePayoutInputDto>(
        '/payment/stripe/connect-account/payout',
        {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        query,
    );
}

export async function paymentStripeTransactions(
    token: string,
    query: PaymentStripeTransactionsInputDto,
): Promise<AxiosResponse<PaymentStripeTransactionsResponseDto>> {
    const self: T721SDK = this;

    return self.post<PaymentStripeTransactionsInputDto>(
        '/payment/stripe/connect-account/transactions',
        {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        query,
    );
}
