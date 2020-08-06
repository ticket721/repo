import { AxiosResponse }                          from 'axios';
import { T721SDK }                                from '../../index';
import { PaymentStripeFetchInterfaceResponseDto } from '@app/server/controllers/payment/stripe/dto/PaymentStripeFetchInterfaceResponse.dto';

export async function paymentStripeFetchInterface(
    token: string
): Promise<AxiosResponse<PaymentStripeFetchInterfaceResponseDto>> {

    const self: T721SDK = this;

    return self.get('/payment/stripe', {
        Authorization: `Bearer ${token}`
    });
}
