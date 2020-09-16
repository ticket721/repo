import { useTranslation }                       from 'react-i18next';
import React, { useState }                      from 'react';
import {
    SectionWithLinkHeader,
} from './StripeMenuSections';
import styled                                   from 'styled-components';
import './SSCAExternalAccountListManager.locales';
import { Icon, FullPageLoading, Error }         from '@frontend/flib-react/lib/components';
import { PaymentStripeTransactionsResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/payment/stripe/dto/PaymentStripeTransactionsResponse.dto';
import { useHistory }                           from 'react-router';
import { v4 }                                   from 'uuid';
import { useSelector }                          from 'react-redux';
import { AppState }                             from '../../../redux';
import { useRequest }                           from '../../../hooks/useRequest';
import { symbolOf }                             from '@common/global';
import { formatShort }                          from '../../../utils/date';
import './SSCATransactionListManager.locales';

const MoreIcon = styled(Icon)`
    text-align: end;
    cursor: pointer;
`;

// tslint:disable-next-line:no-empty-interface
export interface SSCATransactionListManagerProps {
}

type TxType =
    | 'adjustment'
    | 'advance'
    | 'advance_funding'
    | 'application_fee'
    | 'application_fee_refund'
    | 'charge'
    | 'connect_collection_transfer'
    | 'issuing_authorization_hold'
    | 'issuing_authorization_release'
    | 'issuing_transaction'
    | 'payment'
    | 'payment_failure_refund'
    | 'payment_refund'
    | 'payout'
    | 'payout_cancel'
    | 'payout_failure'
    | 'refund'
    | 'refund_failure'
    | 'reserve_transaction'
    | 'reserved_funds'
    | 'stripe_fee'
    | 'stripe_fx_fee'
    | 'tax_fee'
    | 'topup'
    | 'topup_reversal'
    | 'transfer'
    | 'transfer_cancel'
    | 'transfer_failure'
    | 'transfer_refund';

const TxTypeColors = {
    'adjustment': 'normal',
    'advance': 'normal',
    'advance_funding': 'normal',
    'application_fee': 'normal',
    'application_fee_refund': 'error',
    'charge': 'normal',
    'connect_collection_transfer': 'normal',
    'issuing_authorization_hold': 'normal',
    'issuing_authorization_release': 'normal',
    'issuing_transaction': 'normal',
    'payment': 'normal',
    'payment_failure_refund': 'error',
    'payment_refund': 'error',
    'payout': 'normal',
    'payout_cancel': 'error',
    'payout_failure': 'error',
    'refund': 'normal',
    'refund_failure': 'error',
    'reserve_transaction': 'normal',
    'reserved_funds': 'normal',
    'stripe_fee': 'normal',
    'stripe_fx_fee': 'normal',
    'tax_fee': 'normal',
    'topup': 'normal',
    'topup_reversal': 'error',
    'transfer': 'normal',
    'transfer_cancel': 'error',
    'transfer_failure': 'error',
    'transfer_refund': 'error'
}

interface TransactionInfo {
    id: string;
    object: 'balance_transaction';
    amount: number;
    available_on: number;
    created: number;
    currency: string;
    description: string | null;
    exchange_rate: number | null;
    fee: number;
    fee_details: any[];
    net: number;
    reporting_category: string;
    source: string | null;
    status: string;
    type: TxType;
}

interface TransactionInfoCardProps {
    transaction: TransactionInfo;
}

interface ContainerProps {
    color: string;
}

const Container = styled.div<ContainerProps>`
    max-width: 500px;
    background-color: ${props => props.color === 'error' ? '#332222' : '#24232c'};
    padding: ${(props) => props.theme.regularSpacing};
    margin: ${(props) => props.theme.regularSpacing};
    border-radius: ${(props) => props.theme.defaultRadius};
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
    cursor: pointer;
    z-index: 10;
`;

const Description = styled.span`
  margin: 0;
  text-transform: uppercase;
  font-size: 16px;
  font-weight: 500;
`;

interface PriceProps {
    amount: number;
}

const Price = styled.span<PriceProps>`
  margin: 0;
  color: ${props => props.theme.textColorDark};
  font-size: 16px;
`

const TitleAndPriceContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const DateContainer = styled.div`
  margin-top: ${props => props.theme.smallSpacing};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const DateText = styled.span`
  margin: 0;
  color: ${props => props.theme.textColorDark};
  font-size: 14px;
`;

interface StatusTextProps {
    color: string;
}

const StatusText = styled.span<StatusTextProps>`
  text-transform: capitalize;
  margin: 0;
  color: ${props => props.color === 'error' ? props.theme.errorColor.hex : props.theme.textColor};
  font-size: 14px;
`;

const TransactionInfoCard: React.FC<TransactionInfoCardProps> = (props: TransactionInfoCardProps): JSX.Element => {
    return <Container color={TxTypeColors[props.transaction.type]}>
        <TitleAndPriceContainer>
            <Description>{props.transaction.description || props.transaction.type}</Description>
            <Price amount={props.transaction.amount} >{props.transaction.amount < 0 ? '-' : ''} {symbolOf(props.transaction.currency)} {Math.abs(props.transaction.amount / 100).toLocaleString()}</Price>
        </TitleAndPriceContainer>
        <DateContainer>
            <DateText>{formatShort(new Date(props.transaction.created * 1000))}</DateText>
            <StatusText color={TxTypeColors[props.transaction.type]} >{props.transaction.type.replace('_', ' ')}</StatusText>
        </DateContainer>
    </Container>
}

const NoTxText = styled.span`
  opacity: 0.6;
  font-size: 14px;
  margin: 0;
`;

export const SSCATransactionListListManager: React.FC<SSCATransactionListManagerProps> = (
): JSX.Element => {
    const [t] = useTranslation('stripe_transaction_list');
    const history = useHistory();
    const [uuid] = useState(v4());
    const { token } = useSelector((state: AppState) => ({ token: state.auth.token?.value }));

    const transactionsReq = useRequest<PaymentStripeTransactionsResponseDto>(
        {
            method: 'payment.stripe.transactions',
            args: [
                token,
                {
                    limit: 10
                }
            ],
            refreshRate: 10,
        },
        uuid,
    );

    if (transactionsReq.response.error) {
        return <>
            <SectionWithLinkHeader>
                <span>{t('title')}</span>
            </SectionWithLinkHeader>
            <Error
                message={'cannot fetch transactions'}
                onRefresh={transactionsReq.force}
                retryLabel={'refresh'}
            />;
        </>
    }

    return (
        <>
            <SectionWithLinkHeader>
                <span>{t('title')}</span>
                {
                    transactionsReq.response.data?.transactions?.has_more

                        ?
                        <MoreIcon
                            icon={'arrow'}
                            size={'14px'}
                            color={'white'}
                            onClick={() => history.push('/stripe/transaction')}
                        />

                        :
                        null
                }
            </SectionWithLinkHeader>
            {
                transactionsReq.response.loading

                    ?
                    <FullPageLoading/>

                    :

                    (
                        transactionsReq.response.data.transactions.data.length

                            ?
                            transactionsReq.response.data.transactions.data.map((tx: TransactionInfo, idx: number) => (
                                <TransactionInfoCard
                                    key={idx}
                                    transaction={tx}
                                />
                            ))

                            :
                            <div
                                style={{
                                    width: '100%',
                                    textAlign: 'center',
                                    padding: 12
                                }}
                            >
                                <NoTxText>No available transactions</NoTxText>
                            </div>
                    )
            }
        </>
    );
};
