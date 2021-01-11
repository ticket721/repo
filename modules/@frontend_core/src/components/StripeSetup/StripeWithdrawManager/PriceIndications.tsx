import styled from 'styled-components';
import { Currency } from '@frontend-core/components/StripeSetup/StripeWithdrawManager/Currency';
import React from 'react';
import { format } from '@common/global';
import { useTranslation } from 'react-i18next';
import { useHaptics, HapticsNotificationType } from '../../../hooks/useHaptics';

const IndicationText = styled.span`
    color: white;
    opacity: 0.6;
    font-size: 14px;
    font-weight: 300;
    margin: 0;
`;

export const PriceIndicationsContainer = styled.div`
    width: 100%;
    max-width: 500px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding-left: ${(props) => props.theme.biggerSpacing};
    padding-right: ${(props) => props.theme.biggerSpacing};
    margin-top: ${(props) => props.theme.regularSpacing};
`;

const Bold = styled.span`
    font-weight: 600;
`;

const Clickable = styled.span`
    cursor: pointer;
`;

interface TotalBalanceIndicationProps {
    currency: Currency;
}

export const TotalBalanceIndication: React.FC<TotalBalanceIndicationProps> = (
    props: TotalBalanceIndicationProps,
): JSX.Element => {
    const [t] = useTranslation('stripe_withdraw_manager');
    if (props.currency) {
        return (
            <IndicationText>
                {t('balance')}: {format(props.currency.currency, props.currency.amount)}
            </IndicationText>
        );
    } else {
        return <IndicationText>{t('balance')}: ...</IndicationText>;
    }
};

interface MaxBalanceSelectorProps {
    closeCurrencySelection: () => void;
    currency: Currency;
    setAmount: (value: string) => void;
}

export const MaxBalanceSelector: React.FC<MaxBalanceSelectorProps> = (props: MaxBalanceSelectorProps): JSX.Element => {
    const haptics = useHaptics();
    return (
        <IndicationText
            onClick={() => {
                haptics.notification({
                    type: HapticsNotificationType.SUCCESS,
                });
                props.setAmount(props.currency.amount.toString());
                props.closeCurrencySelection();
            }}
        >
            <Bold>
                <Clickable>MAX</Clickable>
            </Bold>
        </IndicationText>
    );
};
