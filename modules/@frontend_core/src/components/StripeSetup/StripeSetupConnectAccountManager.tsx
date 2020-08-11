import { PasswordlessUserDto }   from '@common/sdk/lib/@backend_nest/apps/server/src/authentication/dto/PasswordlessUser.dto';
import { StripeInterfaceEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/stripeinterface/entities/StripeInterface.entity';
import React, { useState }       from 'react';
import styled                    from 'styled-components';
import { Button, SelectInput }   from '@frontend/flib-react/lib/components';
import { useTranslation }        from 'react-i18next';

// tslint:disable-next-line
const getSymbolFromCurrency = require('currency-symbol-map');


export interface StripeSetupConnectAccountManagerProps {
    user: PasswordlessUserDto;
    stripeInterface: StripeInterfaceEntity;
    forceFetchInterface: () => void;
}

const BalanceContainerPlaceholder = styled.div`
  height: 30vh;
`;

const BalanceContainer = styled.div`
  width: 100vw;
  height: 30vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  z-index: 10;
  background-color: #120f1a;
`;

const MenuContainer = styled.div`
  min-height: 70vh;
  background-color: ${props => props.theme.componentColor};
  z-index: 1;
`;

const fakeBalance = {
    "object": "balance",
    "available": [
        {
            "amount": 100,
            "currency": "eur",
            "source_types": {
                "card": 100
            }
        },
        {
            "amount": 20,
            "currency": "usd",
            "source_types": {
                "card": 20
            }
        }
    ],
    "livemode": false,
    "pending": [
        {
            "amount": 200,
            "currency": "eur",
            "source_types": {
                "card": 200
            }
        },
        {
            "amount": 30,
            "currency": "usd",
            "source_types": {
                "card": 30
            }
        }
    ]
};

interface BalanceCurrencyInfo {
    amount: number;
    pending: number;
    currency: string;
}

interface StripeSetupConnectAccountBalanceManagerProps {
    currencies: BalanceCurrencyInfo[];
}

const BalanceTextContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
const BalanceAvailableText = styled.h1`
  margin-bottom: ${props => props.theme.smallSpacing};
  font-size: 30px;
`;

interface BalancePendingTextProps {
    visible: boolean;
}

const BalancePendingText = styled.h3<BalancePendingTextProps>`
  opacity: ${props => props.visible ? '0.85' : '0'};
  font-weight: 300;
  font-size: 12px;
`;

const BalanceButtonsContainer = styled.div`
  max-width: 500px;
  width: 100%;
  justify-content: space-around;
  align-items: center;
  flex-direction: row;
  display: flex;
`;

const BalanceButton = styled(Button)`
  max-width: 200px;
  width: 40%;
  height: 50px;
`;

const BalanceCurrency = styled(SelectInput)`
  max-width: 200px;
  width: 40%;
  height: 50px;
`;

const recoverHighestBalance = (balances: BalanceCurrencyInfo[]): string => {

    if (balances.length === 0) {
        return 'eur';
    }

    return balances.sort((a: BalanceCurrencyInfo, b: BalanceCurrencyInfo) => (b.amount + b.pending) - (a.amount + a.pending))[0].currency;
};

const getCurrency = (currency: string, balances: BalanceCurrencyInfo[]): BalanceCurrencyInfo => {
    if (balances.length === 0) {
        return {
            currency: 'eur',
            amount: 0,
            pending: 0
        }
    }

    return balances[balances.findIndex((b: BalanceCurrencyInfo) => b.currency === currency)];
};

const formatAmount = (locale: string, currency: string, amount: number): string => {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount / 100)
};

const StripeSetupConnectAccountBalanceManager: React.FC<StripeSetupConnectAccountBalanceManagerProps> = (props: StripeSetupConnectAccountBalanceManagerProps): JSX.Element => {

    const [currency, setCurrency] = useState(recoverHighestBalance(props.currencies));
    const [, i18n] = useTranslation('language');

    const currenciesOptions = props.currencies.length

        ?
        props.currencies.map((curr: BalanceCurrencyInfo) => ({
            label: `${getSymbolFromCurrency(curr.currency)} ${curr.currency.toUpperCase()}`,
            value: curr.currency
        }))

        :
        [{
            label: `${getSymbolFromCurrency('eur')} EUR`,
            value: 'eur'
        }];

    const selectedIdx = currenciesOptions.findIndex((opt: any) => opt.value === currency);

    return <>
        <div style={{height: '48px'}}/>
        <BalanceTextContainer>
            <BalanceAvailableText>{formatAmount(i18n.language, currency, getCurrency(currency, props.currencies).amount)}</BalanceAvailableText>
            <BalancePendingText visible={true}>{formatAmount(i18n.language, currency, getCurrency(currency, props.currencies).pending)} pending</BalancePendingText>
        </BalanceTextContainer>
        <BalanceButtonsContainer>
            <BalanceCurrency
                value={[currenciesOptions[selectedIdx]]}
                options={currenciesOptions}
                searchable={false}
                onChange={(curr: any) => setCurrency(curr.value)}
            />
            <BalanceButton title={'Withdraw'} variant={'disabled'}/>
        </BalanceButtonsContainer>
    </>;
};

const fusionBalances = (stripeBalances: any): BalanceCurrencyInfo[] => {
    const currencies: {[key: string]: BalanceCurrencyInfo} = {};

    for (const availableCurrency of stripeBalances.available) {
        currencies[availableCurrency.currency] = {
            currency: availableCurrency.currency,
            amount: availableCurrency.amount,
            pending: 0
        }
    }

    for (const pendingCurrency of stripeBalances.pending) {
        if (currencies[pendingCurrency.currency]) {
            currencies[pendingCurrency.currency].pending = pendingCurrency.amount;
        } else {
            currencies[pendingCurrency.currency] = {
                currency: pendingCurrency.currency,
                amount: 0,
                pending: pendingCurrency.amount
            }
        }
    }

    return Object.keys(currencies).map((currency: string): BalanceCurrencyInfo => currencies[currency]);
};

const SectionHeader = styled.div`
  background-color: ${props => props.theme.darkBg};
  opacity: 0.75;
  height: 50px;
`;

export const StripeSetupConnectAccountCapabilitiesManager: React.FC<any> = (props: any): JSX.Element => {
    return <>
            <SectionHeader>
                <p>Lol</p>
            </SectionHeader>
        <p>
            Content
        </p>
        <p>
            Content
        </p>
        <p>
            Content
        </p>
        </>
};

export const StripeSetupConnectAccountManager: React.FC<StripeSetupConnectAccountManagerProps> = (props: StripeSetupConnectAccountManagerProps): JSX.Element => {

    return <>
        <BalanceContainer>
            <StripeSetupConnectAccountBalanceManager currencies={fusionBalances(fakeBalance)}/>
        </BalanceContainer>
        <BalanceContainerPlaceholder/>
        <MenuContainer>
            <StripeSetupConnectAccountCapabilitiesManager/>
            <StripeSetupConnectAccountCapabilitiesManager/>
            <StripeSetupConnectAccountCapabilitiesManager/>
            <StripeSetupConnectAccountCapabilitiesManager/>
            <StripeSetupConnectAccountCapabilitiesManager/>
            <StripeSetupConnectAccountCapabilitiesManager/>
            <StripeSetupConnectAccountCapabilitiesManager/>
            <StripeSetupConnectAccountCapabilitiesManager/>
        </MenuContainer>
    </>;
};

