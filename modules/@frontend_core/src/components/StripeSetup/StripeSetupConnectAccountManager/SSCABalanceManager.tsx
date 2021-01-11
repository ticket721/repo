import styled from 'styled-components';
import { Button, SelectInput } from '@frontend/flib-react/lib/components';
import React, { useState } from 'react';
import { useHistory } from 'react-router';
import { format, symbolOf } from '@common/global';
import { HapticsImpactStyle, useHaptics } from '../../../hooks/useHaptics';

export interface BalanceCurrencyInfo {
    amount: number;
    pending: number;
    currency: string;
}

interface SSCABalanceManagerProps {
    name: string;
    currencies: BalanceCurrencyInfo[];
}

const BalanceTextContainer = styled.div`
    width: 100%;
    height: 15vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;
const BalanceAvailableText = styled.h1`
    margin-bottom: ${(props) => props.theme.smallSpacing};
    font-size: 30px;
`;

const AccountNameText = styled.p`
    margin-bottom: ${(props) => props.theme.smallSpacing};
    text-transform: uppercase;
`;

interface BalancePendingTextProps {
    visible: boolean;
}

const BalancePendingText = styled.h3<BalancePendingTextProps>`
    opacity: ${(props) => (props.visible ? '0.85' : '0')};
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
    font-size: 12px;

    & [class$='SingleValue'] {
        font-size: 12px;
    }
`;

const recoverHighestBalance = (balances: BalanceCurrencyInfo[]): string => {
    if (balances.length === 0) {
        return 'eur';
    }

    return balances.sort(
        (a: BalanceCurrencyInfo, b: BalanceCurrencyInfo) => b.amount + b.pending - (a.amount + a.pending),
    )[0].currency;
};

const getCurrency = (currency: string, balances: BalanceCurrencyInfo[]): BalanceCurrencyInfo => {
    if (balances.length === 0) {
        return {
            currency: 'eur',
            amount: 0,
            pending: 0,
        };
    }

    return balances[balances.findIndex((b: BalanceCurrencyInfo) => b.currency === currency)];
};

export const SSCABalanceManager: React.FC<SSCABalanceManagerProps> = (props: SSCABalanceManagerProps): JSX.Element => {
    const [currency, setCurrency] = useState(recoverHighestBalance(props.currencies));
    const history = useHistory();
    const haptics = useHaptics();

    const currenciesOptions = props.currencies.length
        ? props.currencies.map((curr: BalanceCurrencyInfo) => ({
              label: `${symbolOf(curr.currency)} ${curr.currency.toUpperCase()}`,
              value: curr.currency,
          }))
        : [
              {
                  label: `${symbolOf('eur')} EUR`,
                  value: 'eur',
              },
          ];

    const selectedIdx = currenciesOptions.findIndex((opt: any) => opt.value === currency);

    return (
        <>
            <div style={{ height: '48px' }} />
            <BalanceTextContainer>
                <AccountNameText>{props.name}</AccountNameText>
                <BalanceAvailableText>
                    {format(currency, getCurrency(currency, props.currencies).amount)}
                </BalanceAvailableText>
                <BalancePendingText visible={true}>
                    {format(currency, getCurrency(currency, props.currencies).pending)}
                </BalancePendingText>
            </BalanceTextContainer>
            <BalanceButtonsContainer>
                <BalanceCurrency
                    value={[currenciesOptions[selectedIdx]]}
                    options={currenciesOptions}
                    searchable={false}
                    onChange={(curr: any) => {
                        haptics.impact({
                            style: HapticsImpactStyle.Light,
                        });
                        setCurrency(curr[0].value);
                    }}
                />
                <BalanceButton
                    title={'Withdraw'}
                    variant={'primary'}
                    onClick={() => {
                        haptics.impact({
                            style: HapticsImpactStyle.Light,
                        });
                        history.push('/stripe/withdraw');
                    }}
                />
            </BalanceButtonsContainer>
        </>
    );
};
