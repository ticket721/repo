import React, { useState }                         from 'react';
import { Error, FullPageLoading }                  from '@frontend/flib-react/lib/components';
import { PasswordlessUserDto }                     from '@common/sdk/lib/@backend_nest/apps/server/src/authentication/dto/PasswordlessUser.dto';
import { useRequest }                              from '../../hooks/useRequest';
import { v4 }                                      from 'uuid';
import { useSelector }                             from 'react-redux';
import { PaymentStripeFetchInterfaceResponseDto }  from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/payment/stripe/dto/PaymentStripeFetchInterfaceResponse.dto';
import { StripeInterfaceEntity }                   from '@common/sdk/lib/@backend_nest/libs/common/src/stripeinterface/entities/StripeInterface.entity';
import { AppState }                                from '../../redux';
import { StripeSetupCreateConnectAccountManager }  from './StripeSetupCreateConnectAccountManager';
import { StripeSetupCreateExternalAccountManager } from './StripeSetupCreateExternalAccountManager';
import { StripeSetupConnectAccountManager }        from './StripeSetupConnectAccountManager';

const isConnectAccountCreated = (stripeInterface: StripeInterfaceEntity): boolean => {
    return !!stripeInterface.connect_account;
};

const isConnectAccountLinkedToExternalAccount = (stripeInterface: StripeInterfaceEntity): boolean => {
    return !!stripeInterface.connect_account_external_accounts?.length;
};

export interface StripeSetupManagerProps {
    user: PasswordlessUserDto;
}

export const StripeSetupManager = (props: StripeSetupManagerProps): JSX.Element => {

    const [uuid] = useState(v4());
    const { token } = useSelector((state: AppState) => ({ token: state.auth.token?.value }));

    const stripeInterfaceReq = useRequest<PaymentStripeFetchInterfaceResponseDto>({
        method: 'payment.stripe.fetchInterface',
        args: [
            token,
        ],
        refreshRate: 30,
    }, uuid);

    if (stripeInterfaceReq.response.loading) {
        return <FullPageLoading/>;
    }

    if (stripeInterfaceReq.response.error || !stripeInterfaceReq.response.data.stripe_interface) {
        return <Error message={'cannot fetch stripe interface'} retryLabel={'retry'} onRefresh={stripeInterfaceReq.force}/>;
    }

    const stripeInterface: StripeInterfaceEntity = stripeInterfaceReq.response.data.stripe_interface;

    if (!isConnectAccountCreated(stripeInterface)) {
        return <StripeSetupCreateConnectAccountManager user={props.user} stripeInterface={stripeInterface} forceFetchInterface={stripeInterfaceReq.force}/>;
    } else {
        if (!isConnectAccountLinkedToExternalAccount(stripeInterface)) {
            return <StripeSetupCreateExternalAccountManager user={props.user} stripeInterface={stripeInterface} forceFetchInterface={stripeInterfaceReq.force}/>;
        } else {
            return <StripeSetupConnectAccountManager user={props.user} stripeInterface={stripeInterface} forceFetchInterface={stripeInterfaceReq.force}/>;
        }
    }
};

