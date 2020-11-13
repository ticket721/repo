import { RequestBag, useRequest } from '../useRequest';
import { useState } from 'react';
import { v4 } from 'uuid';
import { useToken } from '../useToken';
import { PaymentStripeFetchBalanceResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/payment/stripe/dto/PaymentStripeFetchBalanceResponse.dto';

export const useStripeBalance = (): RequestBag<PaymentStripeFetchBalanceResponseDto> => {
    const [uuid] = useState(v4());
    const token = useToken();

    return useRequest<PaymentStripeFetchBalanceResponseDto>(
        {
            method: 'payment.stripe.fetchBalance',
            args: [token],
            refreshRate: 10,
        },
        uuid,
    );
};
