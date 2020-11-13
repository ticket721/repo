import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { SectionWithLinkHeader } from './StripeMenuSections';
import styled from 'styled-components';
import './SSCAExternalAccountListManager.locales';
import { Icon, FullPageLoading, Error } from '@frontend/flib-react/lib/components';
import { PaymentStripeTransactionsResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/payment/stripe/dto/PaymentStripeTransactionsResponse.dto';
import { useHistory } from 'react-router';
import { v4 } from 'uuid';
import { useToken } from '../../../hooks/useToken';
import { useRequest } from '../../../hooks/useRequest';
import './SSCATransactionListManager.locales';
import { TransactionInfo, TransactionInfoCard } from '../StripeTransactionsManager/TransactionInfoCard';
import { isRequestError } from '../../../utils/isRequestError';

const MoreIcon = styled(Icon)`
    text-align: end;
    cursor: pointer;
`;

const NoTxText = styled.span`
    opacity: 0.6;
    font-size: 14px;
    margin: 0;
`;

// tslint:disable-next-line:no-empty-interface
export interface SSCATransactionListManagerProps {}

export const SSCATransactionListListManager: React.FC<SSCATransactionListManagerProps> = (): JSX.Element => {
    const [t] = useTranslation('stripe_transaction_list');
    const history = useHistory();
    const [uuid] = useState(v4());
    const token = useToken();

    const transactionsReq = useRequest<PaymentStripeTransactionsResponseDto>(
        {
            method: 'payment.stripe.transactions',
            args: [
                token,
                {
                    limit: 10,
                },
            ],
            refreshRate: 10,
        },
        uuid,
    );

    if (isRequestError(transactionsReq)) {
        return (
            <>
                <SectionWithLinkHeader>
                    <span>{t('title')}</span>
                </SectionWithLinkHeader>
                <Error message={'cannot fetch transactions'} onRefresh={transactionsReq.force} retryLabel={'refresh'} />
                ;
            </>
        );
    }

    return (
        <div>
            <SectionWithLinkHeader>
                <span>{t('title')}</span>
                {transactionsReq.response.data?.transactions?.has_more ? (
                    <MoreIcon
                        icon={'arrow'}
                        size={'14px'}
                        color={'white'}
                        onClick={() => history.push('/stripe/transactions')}
                    />
                ) : null}
            </SectionWithLinkHeader>
            {transactionsReq.response.loading ? (
                <FullPageLoading />
            ) : transactionsReq.response.data.transactions.data.length ? (
                transactionsReq.response.data.transactions.data.map((tx: TransactionInfo, idx: number) => (
                    <TransactionInfoCard key={idx} transaction={tx} />
                ))
            ) : (
                <div
                    style={{
                        width: '100%',
                        textAlign: 'center',
                        padding: 12,
                    }}
                >
                    <NoTxText>{t('no_tx')}</NoTxText>
                </div>
            )}
        </div>
    );
};
