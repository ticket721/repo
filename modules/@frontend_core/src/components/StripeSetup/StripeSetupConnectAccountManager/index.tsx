import { PasswordlessUserDto } from '@common/sdk/lib/@backend_nest/apps/server/src/authentication/dto/PasswordlessUser.dto';
import {
    StripeInterfaceEntity
} from '@common/sdk/lib/@backend_nest/libs/common/src/stripeinterface/entities/StripeInterface.entity';
import React from 'react';
import styled from 'styled-components';
import { Icon } from '@frontend/flib-react/lib/components';
import {
    SSCABalanceManager,
    BalanceCurrencyInfo,
} from './SSCABalanceManager';
import { SSCARequirementsManager } from './SSCARequirementsManager';
import { SSCACapabilitiesManager } from './SSCACapabilitiesManager';
import { isAccountReady } from './isAccountReady';
import { SSCAExternalAccountListManager } from './SSCAExternalAccountListManager';

const BalanceContainerPlaceholder = styled.div`
    height: calc(30vh + env(safe-area-inset-top));
    height: calc(30vh + constant(safe-area-inset-top));
    margin-top: -env(safe-area-inset-top);
    margin-top: -constant(safe-area-inset-top);
`;

const BalanceContainer = styled.div`
    width: 100vw;
    height: calc(30vh + env(safe-area-inset-top));
    height: calc(30vh + constant(safe-area-inset-top));
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 0;
    z-index: 10;
    background-color: #120f1a;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
`;

const MenuContainer = styled.div`
    min-height: calc(70vh - env(safe-area-inset-top));
    min-height: calc(70vh - constant(safe-area-inset-top));
    width: 100vw;
    max-width: 500px;
    padding-bottom: calc(16px + env(safe-area-inset-bottom));
    padding-bottom: calc(16px + constant(safe-area-inset-bottom));
    background-color: ${(props) => props.theme.componentColor};
    z-index: 1;
`;

const fusionBalances = (stripeBalances: any): BalanceCurrencyInfo[] => {
    const currencies: { [key: string]: BalanceCurrencyInfo } = {};

    for (const availableCurrency of stripeBalances.available) {
        currencies[availableCurrency.currency] = {
            currency: availableCurrency.currency,
            amount: availableCurrency.amount,
            pending: 0,
        };
    }

    for (const pendingCurrency of stripeBalances.pending) {
        if (currencies[pendingCurrency.currency]) {
            currencies[pendingCurrency.currency].pending = pendingCurrency.amount;
        } else {
            currencies[pendingCurrency.currency] = {
                currency: pendingCurrency.currency,
                amount: 0,
                pending: pendingCurrency.amount,
            };
        }
    }

    return Object.keys(currencies).map((currency: string): BalanceCurrencyInfo => currencies[currency]);
};

const GlobalContainer = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

interface VeilContainerProps {
    visible: boolean;
}

const VeilContainer = styled.div<VeilContainerProps>`
    z-index: 1000;
    opacity: ${(props) => (props.visible ? '1' : '0.3')};
`;

const RefreshIcon = styled(Icon)`
    position: fixed;
    top: calc(16px + env(safe-area-inset-top));
    top: calc(16px + constant(safe-area-inset-top));
    right: 24px;
    z-index: 10000;
`;

export interface StripeSetupConnectAccountManagerProps {
    user: PasswordlessUserDto;
    stripeInterface: StripeInterfaceEntity;
    forceFetchInterface: () => void;
    balance: any;
}

export const StripeSetupConnectAccountManager: React.FC<StripeSetupConnectAccountManagerProps> = (
    props: StripeSetupConnectAccountManagerProps,
): JSX.Element => {
    console.log(props.balance);
    return (
        <GlobalContainer>
            <BalanceContainer>
                <SSCABalanceManager currencies={fusionBalances(props.balance)} />
            </BalanceContainer>
            <RefreshIcon color={'white'} icon={'refresh'} size={16} onClick={props.forceFetchInterface} />
            <BalanceContainerPlaceholder />
            <MenuContainer>
                <SSCARequirementsManager
                    stripeInterface={props.stripeInterface}
                    forceRefresh={props.forceFetchInterface}
                />
                <VeilContainer visible={isAccountReady(props.stripeInterface)}>
                    <SSCACapabilitiesManager
                        capabilities={props.stripeInterface.connect_account_capabilities || []}
                    />
                    <SSCAExternalAccountListManager 
                        external_accounts={props.stripeInterface.connect_account_external_accounts}
                    forceRefresh={props.forceFetchInterface}
                    />
                </VeilContainer>
            </MenuContainer>
        </GlobalContainer>
    );
};
