import React from 'react';
import { Error, FullPageLoading } from '@frontend/flib-react/lib/components';
import { PasswordlessUserDto } from '@common/sdk/lib/@backend_nest/apps/server/src/authentication/dto/PasswordlessUser.dto';
import { StripeInterfaceEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/stripeinterface/entities/StripeInterface.entity';
import { StripeSetupCreateConnectAccountManager } from './StripeSetupCreateConnectAccountManager';
import { StripeSetupCreateExternalAccountManager } from './StripeSetupCreateExternalAccountManager';
import { StripeSetupConnectAccountManager } from './StripeSetupConnectAccountManager';
import { StripeSetupCreateStripeInterfaceManager } from './StripeSetupCreateStripeInterfaceManager';
import { useStripeInterface } from '../../hooks/useStripeInterface';
import { useStripeBalance } from '../../hooks/useStripeBalance';
import { isRequestError } from '../../utils/isRequestError';
import { getEnv } from '../../utils/getEnv';

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
    const stripeInterfaceReq = useStripeInterface();
    const stripeBalanceReq = useStripeBalance();

    if (stripeInterfaceReq.response.loading || stripeBalanceReq.response.loading) {
        return <FullPageLoading />;
    }

    if (isRequestError(stripeBalanceReq)) {
        return (
            <Error message={'cannot fetch stripe balance'} retryLabel={'retry'} onRefresh={stripeInterfaceReq.force} />
        );
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
    const stripeBalance = stripeBalanceReq.response.data.balance;

    const force = () => {
        stripeInterfaceReq.force(parseInt(getEnv().REACT_APP_ERROR_THRESHOLD, 10));
        stripeBalanceReq.force(parseInt(getEnv().REACT_APP_ERROR_THRESHOLD, 10));
    };

    if (!stripeInterface) {
        return <StripeSetupCreateStripeInterfaceManager forceFetchInterface={force} />;
    }

    if (!isConnectAccountCreated(stripeInterface)) {
        return (
            <StripeSetupCreateConnectAccountManager
                user={props.user}
                stripeInterface={stripeInterface}
                forceFetchInterface={force}
            />
        );
    } else {
        if (!isConnectAccountLinkedToExternalAccount(stripeInterface)) {
            return (
                <StripeSetupCreateExternalAccountManager
                    user={props.user}
                    stripeInterface={stripeInterface}
                    forceFetchInterface={force}
                />
            );
        } else {
            return (
                <StripeSetupConnectAccountManager
                    user={props.user}
                    balance={stripeBalance}
                    stripeInterface={stripeInterface}
                    forceFetchInterface={force}
                />
            );
        }
    }
};
