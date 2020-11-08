import React, { useState } from 'react';
import { Error, FullPageLoading } from '@frontend/flib-react/lib/components';
import { PasswordlessUserDto } from '@common/sdk/lib/@backend_nest/apps/server/src/authentication/dto/PasswordlessUser.dto';
import { useRequest } from '../../hooks/useRequest';
import { v4 } from 'uuid';
import { useSelector } from 'react-redux';
import { PaymentStripeFetchInterfaceResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/payment/stripe/dto/PaymentStripeFetchInterfaceResponse.dto';
import { StripeInterfaceEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/stripeinterface/entities/StripeInterface.entity';
import { AppState } from '../../redux';
import { StripeSetupCreateExternalAccountManager } from './StripeSetupCreateExternalAccountManager';
import { useHistory, Redirect } from 'react-router';
import { isRequestError } from '../../utils/isRequestError';

const isConnectAccountCreated = (stripeInterface: StripeInterfaceEntity): boolean => {
    return !!stripeInterface.connect_account;
};

export interface StripeCreateBankAccountManagerProps {
    user: PasswordlessUserDto;
}

export const StripeCreateBankAccountManager = (props: StripeCreateBankAccountManagerProps): JSX.Element => {
    const [uuid] = useState(v4());
    const { token } = useSelector((state: AppState) => ({ token: state.auth.token?.value }));
    const history = useHistory();

    const stripeInterfaceReq = useRequest<PaymentStripeFetchInterfaceResponseDto>(
        {
            method: 'payment.stripe.fetchInterface',
            args: [token],
            refreshRate: 30,
        },
        uuid,
    );

    if (stripeInterfaceReq.response.loading) {
        return <FullPageLoading />;
    }

    if (isRequestError(stripeInterfaceReq)) {
        return (
            <Error
                message={'cannot fetch stripe interface'}
                retryLabel={'retry'}
                onRefresh={stripeInterfaceReq.force}
            />
        );
    }

    const stripeInterface: StripeInterfaceEntity = stripeInterfaceReq.response.data.stripe_interface;

    if (!stripeInterface) {
        return <Redirect to={'/stripe/connect'} push={false} />;
    }

    if (isConnectAccountCreated(stripeInterface)) {
        return (
            <StripeSetupCreateExternalAccountManager
                user={props.user}
                stripeInterface={stripeInterface}
                forceFetchInterface={stripeInterfaceReq.force}
                onDone={() => history.goBack()}
            />
        );
    } else {
        return <Redirect to={'/stripe/connect'} push={false} />;
    }
};
