import React, { useState }                                                                from 'react';
import styled                                                                             from 'styled-components';
import { Error, FullButtonCta }                                                           from '@frontend/flib-react/lib/components';
import { useDeepEffect }                                                                  from '../../../hooks/useDeepEffect';
import { useStripeInterface }                                                             from '../../../hooks/useStripeInterface';
import { useStripeBalance }                                                               from '../../../hooks/useStripeBalance';
import { useDispatch }                                                                    from 'react-redux';
import { useToken }                                                                       from '../../../hooks/useToken';
import { v4 }                                                                             from 'uuid';
import { useLazyRequest }                                                                 from '../../../hooks/useLazyRequest';
import { PushNotification }                                                               from '../../../redux/ducks/notifications';
import { useHistory }                                                                     from 'react-router';
import { useTranslation }                                                                 from 'react-i18next';
import { BankAccountSelection }                                                           from './BankAccountSelection';
import { CurrencySelector, CurrencyValue, PriceSelectionContainer, PriceSelectionDrawer } from './PriceSelection';
import { MaxBalanceSelector, PriceIndicationsContainer, TotalBalanceIndication }          from './PriceIndications';
import './StripeWithdrawManager.locales';
import { isRequestError }                                                                 from '../../../utils/isRequestError';
import { HapticsImpactStyle, useHaptics }                                                 from '../../../utils/useHaptics';

const Container = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const TitleContainer = styled.div`
    width: 100%;
    max-width: 500px;
    padding: ${(props) => props.theme.regularSpacing};
    text-align: start;
`;

const WithdrawTitle = styled.span`
    text-transform: uppercase;
    opacity: 0.7;
    font-size: 16px;
    font-weight: 400;
    margin: 0;
`;

const ConfigurationContainer = styled.div`
    width: 100%;
    max-width: 500px;
    height: 150px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #ffffff04;
`;

const showCta = (selectedAccount: number, amount: string): boolean => {
    return !(selectedAccount === null || amount === '' || parseInt(amount, 10) < 100);
};

export const StripeWithdrawManager: React.FC = (): JSX.Element => {
    const [t] = useTranslation('stripe_withdraw_manager');
    const [currency, setCurrency] = useState(null);
    const [currencySelectionOpen, setCurrencySelectionOpen] = useState(false);
    const [clicked, setClicked] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [amount, setAmount] = useState('');
    const stripeInterfaceRequestBag = useStripeInterface();
    const stripeBalanceRequestBag = useStripeBalance();
    const token = useToken();
    const [uuid] = useState(v4());
    const createStripePayoutRequest = useLazyRequest('payment.stripe.payout', uuid);
    const dispatch = useDispatch();
    const history = useHistory();
    const haptics = useHaptics();

    useDeepEffect(() => {
        if (currency !== null && amount !== null && amount !== '' && amount !== '0' && clicked) {
            if (!stripeInterfaceRequestBag.response.data) {
                dispatch(PushNotification('Cannot retrieve external account info', 'error'));
                return;
            }

            const stripeInterface = stripeInterfaceRequestBag.response.data.stripe_interface;

            const accounts = stripeInterface.connect_account_external_accounts.filter(
                (acct: any) => acct.currency.toLowerCase() === currency.currency.toLowerCase(),
            );

            const account = accounts[selectedAccount];

            if (!createStripePayoutRequest.response.called) {
                createStripePayoutRequest.lazyRequest(
                    [
                        token,
                        {
                            amount: parseInt(amount, 10),
                            destination: account.id,
                            currency: currency.currency.toLowerCase(),
                        },
                    ],
                    {
                        force: true,
                    },
                );
            } else {
                if (createStripePayoutRequest.response.error) {
                    setClicked(false);
                    dispatch(PushNotification(createStripePayoutRequest.response.error.message, 'error'));
                } else if (createStripePayoutRequest.response.data) {
                    dispatch(PushNotification(t('payout_triggered'), 'success'));
                    history.goBack();
                }
            }
        }
    }, [currency, amount, clicked, selectedAccount, createStripePayoutRequest.response, token]);

    useDeepEffect(() => {
        if (currency && stripeInterfaceRequestBag.response.data) {
            setSelectedAccount(
                stripeInterfaceRequestBag.response.data.stripe_interface.connect_account_external_accounts
                    .filter((acct: any): boolean => acct.currency.toLowerCase() === currency.currency.toLowerCase())
                    .findIndex((acct: any): boolean => acct.default_for_currency),
            );
        }
    }, [stripeInterfaceRequestBag.response.data, currency]);

    useDeepEffect(() => {
        if (stripeBalanceRequestBag.response?.data) {
            if (currency === null) {
                setCurrency(stripeBalanceRequestBag.response.data.balance.available[0]);
            }
        }
    }, [stripeBalanceRequestBag.response.data]);

    return (
        <Container>
            <TitleContainer>
                <WithdrawTitle>{t('title')}</WithdrawTitle>
            </TitleContainer>
            <ConfigurationContainer>
                {isRequestError(stripeBalanceRequestBag) ? (
                    <Error
                        message={t('cannot_fetch_balance')}
                        onRefresh={stripeBalanceRequestBag.force}
                        retryLabel={t('retry')}
                    />
                ) : (
                    <>
                        <PriceSelectionContainer>
                            <CurrencySelector
                                currency={currency}
                                setCurrency={setCurrency}
                                isOpen={currencySelectionOpen}
                                setOpen={setCurrencySelectionOpen}
                            />
                            <CurrencyValue currency={currency} amount={amount} setAmount={setAmount} />
                        </PriceSelectionContainer>
                        <PriceIndicationsContainer>
                            <TotalBalanceIndication currency={currency} />
                            <MaxBalanceSelector
                                closeCurrencySelection={() => setCurrencySelectionOpen(false)}
                                currency={currency}
                                setAmount={setAmount}
                            />
                        </PriceIndicationsContainer>
                    </>
                )}
            </ConfigurationContainer>
            <PriceSelectionDrawer
                isOpen={currencySelectionOpen}
                currency={currency}
                setCurrency={setCurrency}
                setOpen={setCurrencySelectionOpen}
            />
            <BankAccountSelection
                stripeInterfaceRequestBag={stripeInterfaceRequestBag}
                selectedAccount={selectedAccount}
                setSelectedAccount={setSelectedAccount}
                currency={currency?.currency}
            />
            <FullButtonCta
                onClick={() => {
                    haptics.impact({
                        style: HapticsImpactStyle.Light
                    })
                    setClicked(true)}
                }
                ctaLabel={t('cta_title')}
                show={showCta(selectedAccount, amount)}
                variant={'primary'}
                loading={clicked}
            />
        </Container>
    );
};
