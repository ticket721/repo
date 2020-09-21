import React, { useCallback, useState }         from 'react';
import { symbolOf }                             from '@common/global';
import { formatShort }                          from '../../../utils/date';
import styled                                   from 'styled-components';
import { v4 }                                   from 'uuid';
import { useSelector }                          from 'react-redux';
import { AppState }                             from '../../../redux';
import { useRequest }                           from '../../../hooks/useRequest';
import { PaymentStripeTransactionsResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/payment/stripe/dto/PaymentStripeTransactionsResponse.dto';
import { FullPageLoading, Error }               from '@frontend/flib-react/lib/components';
import { useInView }                            from 'react-intersection-observer';

export type TxType =
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

export const TxTypeColors = {
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
    'transfer_refund': 'error',
};

export interface TransactionInfo {
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

const MarginContainer = styled.div`
  padding-left: ${(props) => props.theme.regularSpacing};
  padding-right: ${(props) => props.theme.regularSpacing};
  margin-top: ${(props) => props.theme.regularSpacing};
  margin-bottom: ${(props) => props.theme.regularSpacing};
  box-sizing: border-box;
  max-width: 500px;
  width: 100%;
`

export interface ContainerProps {
    color: string;
}

export const Container = styled.div<ContainerProps>`
    width: 100%;
    background-color: ${(props => {

    switch (props.color) {
        case 'error': {
            return '#332222'
        }
        case 'loading': {
            return '#110e1f'
        }
        default: {
            return '#24232c'
        }
    }
})
    // props.color === 'error' ? '#332222' : '#24232c'
};
    padding: ${(props) => props.theme.regularSpacing};
    border-radius: ${(props) => props.theme.defaultRadius};
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
    cursor: pointer;
    z-index: 10;
`;

export const Description = styled.span`
  margin: 0;
  text-transform: uppercase;
  font-size: 16px;
  font-weight: 500;
`;

export interface PriceProps {
    amount: number;
}

export const Price = styled.span<PriceProps>`
  margin: 0;
  color: ${props => props.theme.textColorDark};
  font-size: 16px;
`;

export const TitleAndPriceContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const DateContainer = styled.div`
  margin-top: ${props => props.theme.smallSpacing};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const DateText = styled.span`
  margin: 0;
  color: ${props => props.theme.textColorDark};
  font-size: 14px;
`;

export interface StatusTextProps {
    color: string;
}

export const StatusText = styled.span<StatusTextProps>`
  text-transform: capitalize;
  margin: 0;
  color: ${props => props.color === 'error' ? props.theme.errorColor.hex : props.theme.textColor};
  font-size: 14px;
`;

export interface TransactionInfoCardProps {
    transaction: TransactionInfo;
    forwardedRef?: any;
}

export const TransactionInfoCard: React.FC<TransactionInfoCardProps> = (props: TransactionInfoCardProps): JSX.Element => {

    return <MarginContainer>
        <Container color={TxTypeColors[props.transaction.type]} ref={props.forwardedRef}>
            <TitleAndPriceContainer>
                <Description>{props.transaction.description || props.transaction.type}</Description>
                <Price
                    amount={props.transaction.amount}>{props.transaction.amount < 0 ? '-' : ''} {symbolOf(props.transaction.currency)} {Math.abs(props.transaction.amount / 100).toLocaleString()}</Price>
            </TitleAndPriceContainer>
            <DateContainer>
                <DateText>{formatShort(new Date(props.transaction.created * 1000))}</DateText>
                <StatusText color={TxTypeColors[props.transaction.type]}>{props.transaction.type.replace('_', ' ')}</StatusText>
            </DateContainer>
        </Container>
    </MarginContainer>
};

export interface StripeTransactionsSegmentProps {
    start: string | null;
    limit: number;
    retry: (() => void) | null;
}

const StripeTransactionSegment: React.FC<StripeTransactionsSegmentProps> = (props: StripeTransactionsSegmentProps): JSX.Element => {

    const [uuid] = useState(v4());
    const { token } = useSelector((state: AppState) => ({ token: state.auth.token?.value }));
    const [ref, inView] = useInView();

    console.log(inView);

    const transactionsReq = useRequest<PaymentStripeTransactionsResponseDto>(
        {
            method: 'payment.stripe.transactions',
            args: [
                token,
                {
                    limit: props.limit,
                    starting_after: props.start,
                },
            ],
            refreshRate: 10,
        },
        uuid,
    );

    const force = useCallback(() => {
        if (props.retry) {
            props.retry();
        }
        transactionsReq.force()
    }, [props.retry, transactionsReq.force]);

    if (transactionsReq.response.loading) {
        return <>
            {
                [...new Array(props.limit)].map((_: any, idx: number) => (
                    <MarginContainer>
                        <Container color={'loading'} key={idx} style={{height: 72}}>
                            <FullPageLoading/>
                        </Container>
                    </MarginContainer>
                ))
            }
        </>
    }

    if (transactionsReq.response.error) {
        return <Error
            message={'cannot load transactions'}
            retryLabel={'reload'}
            onRefresh={force}
        />
    }

    if (transactionsReq.response.data.transactions.has_more) {
        return <>
            {
                transactionsReq.response.data.transactions.data.slice(0, -1).map(
                    (tx: TransactionInfo, idx: number) => (
                        <TransactionInfoCard transaction={tx} key={idx}/>
                    )
                )
            }
            <TransactionInfoCard
                transaction={
                    transactionsReq.response.data.transactions.data[transactionsReq.response.data.transactions.data.length - 1] as TransactionInfo
                }
                forwardedRef={ref}
            />
            {
                inView

                    ?
                    <StripeTransactionSegment
                        start={transactionsReq.response.data.transactions.data[transactionsReq.response.data.transactions.data.length - 1].id}
                        limit={10}
                        retry={force}
                    />

                    :
                    null
            }
        </>
    } else {
        return <>
            {
                transactionsReq.response.data.transactions.data.map(
                    (tx: TransactionInfo, idx: number) => (
                        <TransactionInfoCard transaction={tx} key={idx}/>
                    )
                )
            }
        </>
    }

};

// tslint:disable-next-line:no-empty-interface
export interface StripeTransactionsManagerProps {
}

export const StripeTransactionsManager: React.FC<StripeTransactionsManagerProps> = (props: StripeTransactionsManagerProps): JSX.Element => {
    return <div
        style={{
            width: '100%'
        }}
    >
        <StripeTransactionSegment start={null} limit={10} retry={null}/>
    </div>
};
