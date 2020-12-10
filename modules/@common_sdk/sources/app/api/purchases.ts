import { AxiosResponse }              from 'axios';
import { T721SDK }                    from '../../index';
import { PurchasesFetchResponseDto }            from '@app/server/controllers/purchases/dto/PurchasesFetchResponse.dto';
import { PurchasesSetProductsInputDto }         from '@app/server/controllers/purchases/dto/PurchasesSetProductsInput.dto';
import { PurchasesSetProductsResponseDto }      from '@app/server/controllers/purchases/dto/PurchasesSetProductsResponse.dto';
import { PurchasesCheckoutInputDto }            from '@app/server/controllers/purchases/dto/PurchasesCheckoutInput.dto';
import { PurchasesCheckoutResponseDto }         from '@app/server/controllers/purchases/dto/PurchasesCheckoutResponse.dto';
import { PurchasesCloseInputDto }               from '@app/server/controllers/purchases/dto/PurchasesCloseInput.dto';
import { PurchasesCloseResponseDto }            from '@app/server/controllers/purchases/dto/PurchasesCloseResponse.dto';

export async function purchasesFetch(
    token: string
): Promise<AxiosResponse<PurchasesFetchResponseDto>> {

    const self: T721SDK = this;

    return self.get('/purchases', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    });
}

export async function purchasesSetProducts(
    token: string,
    query: PurchasesSetProductsInputDto
): Promise<AxiosResponse<PurchasesSetProductsResponseDto>> {

    const self: T721SDK = this;

    return self.put<PurchasesSetProductsInputDto>('/purchases', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function purchasesCheckout(
    token: string,
    query: PurchasesCheckoutInputDto
): Promise<AxiosResponse<PurchasesCheckoutResponseDto>> {

    const self: T721SDK = this;

    return self.post<PurchasesCheckoutInputDto>('/purchases/checkout', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function purchasesClose(
    token: string,
    mailActionUrl: string
): Promise<AxiosResponse<PurchasesCloseResponseDto>> {

    const self: T721SDK = this;

    return self.post<PurchasesCloseInputDto>('/purchases/close', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, {
        mailActionUrl
    });
}
