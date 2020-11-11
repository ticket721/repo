import React, { useCallback, useState } from 'react';
import { v4 } from 'uuid';
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux';
import { useRequest } from '../../../hooks/useRequest';
import { PaymentStripeTransactionsResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/payment/stripe/dto/PaymentStripeTransactionsResponse.dto';
import { FullPageLoading, Error } from '@frontend/flib-react/lib/components';
import { useInView } from 'react-intersection-observer';
import { Container, MarginContainer, TransactionInfo, TransactionInfoCard } from './TransactionInfoCard';
import './StripeTransactionsManager.locales';
import { useTranslation } from 'react-i18next';
import { isRequestError } from '../../../utils/isRequestError';
import { getEnv } from '../../../utils/getEnv';

export interface StripeTransactionsSegmentProps {
    start: string | null;
    limit: number;
    retry: (() => void) | null;
}

const StripeTransactionSegment: React.FC<StripeTransactionsSegmentProps> = (
    props: StripeTransactionsSegmentProps,
): JSX.Element => {
    const [uuid] = useState(v4());
    const { token } = useSelector((state: AppState) => ({ token: state.auth.token?.value }));
    const [ref, inView] = useInView();
    const [t] = useTranslation('stripe_transactions_manager');

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
        transactionsReq.force(parseInt(getEnv().REACT_APP_ERROR_THRESHOLD, 10));
    }, [props.retry, transactionsReq.force]);

    if (transactionsReq.response.loading) {
        return (
            <>
                {[...new Array(props.limit)].map((_: any, idx: number) => (
                    <MarginContainer key={idx}>
                        <Container color={'loading'} style={{ height: 72 }}>
                            <FullPageLoading />
                        </Container>
                    </MarginContainer>
                ))}
            </>
        );
    }

    if (isRequestError(transactionsReq)) {
        return <Error message={t('cannot_load_txs')} retryLabel={t('retry')} onRefresh={force} />;
    }

    if (transactionsReq.response.data.transactions.has_more) {
        return (
            <>
                {transactionsReq.response.data.transactions.data
                    .slice(0, -1)
                    .map((tx: TransactionInfo, idx: number) => (
                        <TransactionInfoCard transaction={tx} key={idx} />
                    ))}
                <TransactionInfoCard
                    transaction={
                        transactionsReq.response.data.transactions.data[
                            transactionsReq.response.data.transactions.data.length - 1
                        ] as TransactionInfo
                    }
                    forwardedRef={ref}
                />
                {inView ? (
                    <StripeTransactionSegment
                        start={
                            transactionsReq.response.data.transactions.data[
                                transactionsReq.response.data.transactions.data.length - 1
                            ].id
                        }
                        limit={10}
                        retry={force}
                    />
                ) : null}
            </>
        );
    } else {
        return (
            <>
                {transactionsReq.response.data.transactions.data.map((tx: TransactionInfo, idx: number) => (
                    <TransactionInfoCard transaction={tx} key={idx} />
                ))}
            </>
        );
    }
};

export const StripeTransactionsManager: React.FC = (): JSX.Element => {
    return (
        <div
            style={{
                width: '100%',
            }}
        >
            <StripeTransactionSegment start={null} limit={10} retry={null} />
        </div>
    );
};
