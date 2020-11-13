import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import {
    SectionWithLinkHeader,
    FieldsContainer,
    FieldContainer,
    FieldTitle,
    DragToActionSelectionElementContainer,
} from './StripeMenuSections';
import styled, { useTheme } from 'styled-components';
import { ConnectAccountExternalAccount } from '@common/sdk/lib/@backend_nest/libs/common/src/stripeinterface/entities/StripeInterface.entity';
import './SSCAExternalAccountListManager.locales';
import { StatusText, colorFromStatus, StatusIcon } from './StatusUtils';
import { Theme } from '@frontend/flib-react/lib/config/theme';
import { Icon } from '@frontend/flib-react/lib/components';
import { useHistory } from 'react-router';
import { v4 } from 'uuid';
import { useLazyRequest } from '../../../hooks/useLazyRequest';
import { useDispatch } from 'react-redux';
import { useDeepEffect } from '../../../hooks/useDeepEffect';
import { PushNotification } from '../../../redux/ducks/notifications';
import { useToken } from '../../../hooks/useToken';

const BankAccountTitle = styled.h3`
    font-size: 16px;
    font-weight: 400;
`;

const ExternalAccountStatusMapping = {
    new: 'success',
    validated: 'success',
    verified: 'success',
    verification_failed: 'error',
    errored: 'error',
};

const AddIcon = styled(Icon)`
    cursor: pointer;
`;

export interface SSCAExternalAccountListManagerProps {
    external_accounts: ConnectAccountExternalAccount[];
    forceRefresh: () => void;
}

export const SSCAExternalAccountListManager: React.FC<SSCAExternalAccountListManagerProps> = (
    props: SSCAExternalAccountListManagerProps,
): JSX.Element => {
    const [t] = useTranslation('stripe_setup_bank_account_list');
    const theme = useTheme() as Theme;
    const history = useHistory();
    const [uuid, setUUID] = useState(v4());
    const [called, setCalled] = useState(false);
    const token = useToken();
    const removeBankAccountLazyRequest = useLazyRequest('payment.stripe.removeExternalAccount', uuid);
    const setDefaultBankAccountLazyRequest = useLazyRequest('payment.stripe.setDefaultExternalAccount', uuid);
    const dispatch = useDispatch();

    useDeepEffect(() => {
        if (setDefaultBankAccountLazyRequest.response.called) {
            if (setDefaultBankAccountLazyRequest.response.data) {
                props.forceRefresh();
                setCalled(false);
            } else if (setDefaultBankAccountLazyRequest.response.error) {
                dispatch(
                    PushNotification(setDefaultBankAccountLazyRequest.response.error.response.data.message, 'error'),
                );
                setCalled(false);
            }
        }
    }, [setDefaultBankAccountLazyRequest]);

    const setDefault = (account: string) => {
        return () => {
            if (!called) {
                setDefaultBankAccountLazyRequest.lazyRequest(
                    [
                        token,
                        {
                            external_account_id: account,
                        },
                        uuid,
                    ],
                    {
                        force: true,
                    },
                );
                setCalled(true);
                setUUID(v4());
            }
        };
    };

    useDeepEffect(() => {
        if (removeBankAccountLazyRequest.response.called) {
            if (removeBankAccountLazyRequest.response.data) {
                props.forceRefresh();
                setCalled(false);
            } else if (removeBankAccountLazyRequest.response.error) {
                dispatch(PushNotification(removeBankAccountLazyRequest.response.error.response.data.message, 'error'));
                setCalled(false);
            }
        }
    }, [removeBankAccountLazyRequest]);

    const remove = (account: string) => {
        return () => {
            if (!called) {
                removeBankAccountLazyRequest.lazyRequest(
                    [
                        token,
                        {
                            external_account_id: account,
                        },
                    ],
                    {
                        force: true,
                    },
                );
                setCalled(true);
                setUUID(v4());
            }
        };
    };

    const bankAccounts = props.external_accounts.map((ext: ConnectAccountExternalAccount) => (
        <DragToActionSelectionElementContainer
            key={ext.fingerprint}
            onDelete={remove(ext.id)}
            onDefault={setDefault(ext.id)}
            default={ext.default_for_currency}
            loadingDelete={removeBankAccountLazyRequest.response.loading}
            loadingDefault={setDefaultBankAccountLazyRequest.response.loading}
            currency={ext.currency}
        >
            <FieldsContainer>
                <FieldContainer>
                    <FieldTitle>{t('account_name')}</FieldTitle>
                    <BankAccountTitle>{ext.name}</BankAccountTitle>
                    <FieldTitle>{t('ends_with')}</FieldTitle>
                    <BankAccountTitle>**** ***** **** {ext.last4}</BankAccountTitle>
                </FieldContainer>
                <FieldContainer>
                    <FieldTitle>{t('country')}</FieldTitle>
                    <BankAccountTitle>{ext.country}</BankAccountTitle>
                    <FieldTitle>{t('status')}</FieldTitle>
                    <StatusText color={colorFromStatus(theme, ExternalAccountStatusMapping[ext.status])}>
                        {t(`status__${ext.status}`)}
                        <StatusIcon status={ExternalAccountStatusMapping[ext.status]} />
                    </StatusText>
                </FieldContainer>
            </FieldsContainer>
        </DragToActionSelectionElementContainer>
    ));

    return (
        <>
            <SectionWithLinkHeader>
                <span>{t('title')}</span>
                <AddIcon
                    icon={'plus'}
                    size={'18px'}
                    color={'white'}
                    onClick={() => history.push('/stripe/create-bank-account')}
                />
            </SectionWithLinkHeader>
            {bankAccounts}
        </>
    );
};
