import styled, { useTheme } from 'styled-components';
import { RequestBag } from '@frontend-core/hooks/useRequest';
import { PaymentStripeFetchInterfaceResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/payment/stripe/dto/PaymentStripeFetchInterfaceResponse.dto';
import React from 'react';
import { Theme } from '@frontend/flib-react/lib/config/theme';
import { Error, FullPageLoading, SelectableComponentListElement } from '@frontend/flib-react/lib/components';
import { StripeInterfaceEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/stripeinterface/entities/StripeInterface.entity';
import { useTranslation } from 'react-i18next';

const TitleContainer = styled.div`
    width: 100%;
    max-width: 500px;
    padding: ${(props) => props.theme.regularSpacing};
    text-align: start;
`;

const BankName = styled.p`
    font-size: 18px;
    font-weight: 400;
`;

const DefaultText = styled.span`
    font-size: 14px;
    opacity: 0.5;
`;

const Last4 = styled.p`
    margin-top: ${(props) => props.theme.smallSpacing};
    opacity: 0.5;
    font-size: 14px;
    font-weight: 400;
`;

const BankAccountTitle = styled.span`
    text-transform: uppercase;
    opacity: 0.7;
    font-size: 16px;
    font-weight: 400;
    margin: 0;
`;

interface BankAccountSelectionProps {
    stripeInterfaceRequestBag: RequestBag<PaymentStripeFetchInterfaceResponseDto>;
    selectedAccount: number;
    setSelectedAccount: (idx: number) => void;
    currency: string;
}

export const BankAccountSelection: React.FC<BankAccountSelectionProps> = (
    props: BankAccountSelectionProps,
): JSX.Element => {
    const theme = useTheme() as Theme;
    const [t] = useTranslation('stripe_withdraw_manager');

    if (props.stripeInterfaceRequestBag.response.loading || !props.currency) {
        return <FullPageLoading />;
    }

    if (props.stripeInterfaceRequestBag.response.error) {
        return (
            <Error
                message={'cannot fetch interface'}
                retryLabel={'retry'}
                onRefresh={props.stripeInterfaceRequestBag.force}
            />
        );
    }

    const stripeInterface: StripeInterfaceEntity = props.stripeInterfaceRequestBag.response.data.stripe_interface;
    const accounts = stripeInterface.connect_account_external_accounts.filter(
        (acct: any) => acct.currency.toLowerCase() === props.currency,
    );

    return (
        <div
            style={{
                width: '100%',
                maxWidth: 500,
                marginTop: theme.regularSpacing,
            }}
        >
            <TitleContainer>
                <BankAccountTitle>{t('select_destination_account')}</BankAccountTitle>
            </TitleContainer>
            {accounts.map((ext: any, idx: number) => (
                <SelectableComponentListElement
                    selected={props.selectedAccount === idx}
                    key={`${ext.name}${idx}`}
                    onSelection={() => {
                        props.setSelectedAccount(idx);
                    }}
                >
                    <div
                        style={{
                            padding: theme.regularSpacing,
                        }}
                    >
                        <BankName>
                            {ext.name} <DefaultText>{ext.default_for_currency ? '(default)' : ''}</DefaultText>
                        </BankName>
                        <Last4>**** **** **** {ext.last4}</Last4>
                    </div>
                </SelectableComponentListElement>
            ))}
        </div>
    );
};
