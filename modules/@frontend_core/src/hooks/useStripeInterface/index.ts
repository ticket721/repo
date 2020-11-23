import { RequestBag, useRequest } from '../useRequest';
import { useState } from 'react';
import { v4 } from 'uuid';
import { useToken } from '../useToken';
import { PaymentStripeFetchInterfaceResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/payment/stripe/dto/PaymentStripeFetchInterfaceResponse.dto';

export const useStripeInterface = (): RequestBag<PaymentStripeFetchInterfaceResponseDto> => {
    const [uuid] = useState(v4());
    const token = useToken();

    return useRequest<PaymentStripeFetchInterfaceResponseDto>(
        {
            method: 'payment.stripe.fetchInterface',
            args: [token],
            refreshRate: 10,
        },
        uuid,
    );
};
