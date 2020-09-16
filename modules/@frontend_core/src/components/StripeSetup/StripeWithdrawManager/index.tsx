import React, { useEffect, useMemo, useState } from 'react';
import { PasswordlessUserDto }                                          from '@common/sdk/lib/@backend_nest/apps/server/src/authentication/dto/PasswordlessUser.dto';
import styled, { useTheme }                                             from 'styled-components';
import { Icon, FullPageLoading, Error, SelectableComponentListElement, FullButtonCta } from '@frontend/flib-react/lib/components';
import Cleave                                                                          from 'cleave.js/react';
import {motion}                                                                        from 'framer-motion';
import { useDeepEffect }                                                               from '../../../hooks/useDeepEffect';
import { useStripeInterface }                     from '../../../hooks/useStripeInterface';
import { useStripeBalance }                       from '../../../hooks/useStripeBalance';
import { symbolOf }                               from '@common/global';
import { StripeInterfaceEntity }                  from '@common/sdk/lib/@backend_nest/libs/common/src/stripeinterface/entities/StripeInterface.entity';
import { RequestBag }                             from '../../../hooks/useRequest';
import { PaymentStripeFetchInterfaceResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/payment/stripe/dto/PaymentStripeFetchInterfaceResponse.dto';
import { Theme }                                  from '@frontend/flib-react/lib/config/theme';
import { useDispatch, useSelector }               from 'react-redux';
import { AppState }                               from '@frontend-core/redux';
import { v4 }                                     from 'uuid';
import { useLazyRequest }                         from '../../../hooks/useLazyRequest';
import { PushNotification }                       from '../../../redux/ducks/notifications';
import { useHistory }                             from 'react-router';

export interface StripeWithdrawManagerProps {
    user: PasswordlessUserDto;
}

interface Currency {
    currency: string;
    amount: number;
}

interface CurrencySelectorProps {
    currency: Currency;
    setCurrency: (curr: string) => void;
    isOpen: boolean;
    setOpen: (value: boolean) => void;
}

const CurrencyText = styled.span`
  color: white;
  font-size: 22px;
  font-weight: 400;
  margin: 0;
`;

const IndicationText = styled.span`
  color: white;
  opacity: 0.6;
  font-size: 14px;
  font-weight: 300;
  margin: 0;
`;

const ChangeIcon = styled(Icon)`
  margin-left: ${props => props.theme.smallSpacing};
  margin-right: ${props => props.theme.smallSpacing};
`;

const ChangeContainer = styled(motion.div)`

`;

const CurrencySelector: React.FC<CurrencySelectorProps> = (props: CurrencySelectorProps) => {

    return <div
        style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
        }}
        onClick={() => {
            if (props.currency) {
                props.setOpen(!props.isOpen)}
        }
        }
    >
        <CurrencyText>{props.currency ? props.currency.currency.toUpperCase() : '...'}</CurrencyText>
        {
            props.currency
                ?
                <ChangeContainer
                    variants={{
                        closed: {
                            rotate: 0
                        },
                        open: {
                            rotate: 180
                        }
                    }}
                    transition={{
                        type: 'spring'
                    }}
                    initial={'closed'}
                    animate={props.isOpen ? 'open' : 'closed'}
                >
                    <ChangeIcon icon={'chevron'} size={'8px'}/>
                </ChangeContainer>

                :
                null

        }
    </div>
}

const ValueInput = styled(Cleave)`
  text-align: end;
  font-size: 22px;
  font-weight: 400;
  padding: 0;
  padding-right: 2px;
  font-family: 'Roboto Mono', monospace;
  caret-color: #00000000;
  user-select: none;
  pointer-events: none;
  
  &:focus {
    outline: none;
  }
`

const CaretDiv = styled.div`
    animation: blink-animation 1s ease-in-out infinite;

    @keyframes blink-animation {
        0% {
            background-color: ${props => props.theme.primaryColor.hex};
        }
        50% {
            background-color: #00000000;
        }
        100% {
            background-color: ${props => props.theme.primaryColor.hex};
        }
    }
`;

interface CurrencyValueProps {
    currency: Currency;
    amount: string;
    setAmount: (value: string) => void;
}

const CurrencyValue: React.FC<CurrencyValueProps> = (props: CurrencyValueProps) => {

    const [inputRef, setInputRef] = useState(null);
    const [focused, setFocused] = useState(false);

    const displayed = useMemo(() => {
        if (props.amount === '' || props.amount === '0') {
            return '0.00'
        } else {
            const value = parseInt(props.amount, 10) / 100;
            const decimalsCount = value.toString().split('.')[1]?.length || 0;
            return `${value}${decimalsCount === 0 ? '.' : ''}${'0'.repeat(2 - decimalsCount)}`
        }
    }, [props.amount]);

    useEffect(() => {
        setTimeout(() => {
            if (inputRef) {
                inputRef.focus();
            }
        }, 500);
    }, [inputRef]);

    if (!props.currency) {

        return <div
        >
            <CurrencyText>...</CurrencyText>
        </div>

    }

    return <div
        style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
        }}
        onClick={
            (e) => {
                e.preventDefault();
                if (inputRef) {
                    inputRef.focus();
                }
            }
        }
    >
        <ValueInput
            autoFocus={true}
            inputMode={'numeric'}
            htmlRef={(ref) => setInputRef(ref)}
            style={{
                color: props.amount === '' ? '#666666' : 'white',
                width: '100%'
            }}
            value={displayed}
            options={{
                prefix: `${symbolOf(props.currency.currency)} `,
                numeral: true,
                numeralDecimalMark: '.',
                delimiter: ','
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyUp={(e) => {
                e.preventDefault();
                if (e.key === 'Backspace') {
                    props.setAmount(props.amount.slice(0, -1));
                }
            }}
            onKeyDown={(e) => {
                e.preventDefault()
                const value = parseInt(e.key, 10);
                if (value >= 0 && value <= 9) {
                    const newValue = parseInt(props.amount + e.key, 10);
                    if (newValue <= props.currency.amount) {
                        props.setAmount(newValue.toString());
                    } else {
                        props.setAmount(props.currency.amount.toString());
                    }
                }
            }}
            onChange={(e) => e.preventDefault()}
        />
        <CaretDiv
            style={{
                width: 1,
                height: 22,
                opacity: focused ? 1 : 0
            }}
        />
    </div>;
}

const PriceSelectionContainer = styled.div`
    width: 100%;
    max-width: 500px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding-left: ${props => props.theme.regularSpacing};
    padding-right: ${props => props.theme.regularSpacing};
`;

const PriceIndicationsContainer = styled.div`
    width: 100%;
    max-width: 500px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding-left: ${props => props.theme.biggerSpacing};
    padding-right: ${props => props.theme.biggerSpacing};
    margin-top: ${props => props.theme.regularSpacing};
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
`

const Container = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const Bold = styled.span`
  font-weight: 600;
`

const Clickable = styled.span`
  cursor: pointer;
`

const TitleContainer = styled.div`
  width: 100%;
  max-width: 500px;
  padding: ${props => props.theme.regularSpacing};
  text-align: start;
`

const WithdrawTitle = styled.span`
  text-transform: uppercase;
  opacity: 0.7;
  font-size: 16px;
  font-weight: 400;
  margin: 0;
`;

interface TotalBalanceIndicationProps {
    currency: Currency;
}

const TotalBalanceIndication: React.FC<TotalBalanceIndicationProps> = (props: TotalBalanceIndicationProps): JSX.Element => {
    if (props.currency) {
        return <IndicationText>Balance: {(props.currency.amount / 100).toLocaleString()} {symbolOf(props.currency.currency)}</IndicationText>
    } else {
        return <IndicationText>Balance: ...</IndicationText>
    }
}

interface MaxBalanceSelectorProps {
    closeCurrencySelection: () => void;
    currency: Currency;
    setAmount: (value: string) => void;
}

const MaxBalanceSelector: React.FC<MaxBalanceSelectorProps> = (props: MaxBalanceSelectorProps): JSX.Element => {

    return <IndicationText
        onClick={
            () => {
                props.setAmount(props.currency.amount.toString());
                props.closeCurrencySelection();
            }
        }
    ><Bold><Clickable>MAX</Clickable></Bold></IndicationText>;
}

interface PriceSelectionDrawerProps {
    isOpen: boolean;
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    setOpen: (value: boolean) => void;
}

const DrawerDiv = styled(motion.div)`
  overflow: hidden;
  background-color: ${props => props.theme.darkerBg};
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
`;

const CurrencyButton = styled(motion.div)`
  background-color: ${props => props.theme.componentColorLight};
  padding: ${props => props.theme.smallSpacing};
  margin: ${props => props.theme.regularSpacing};
  margin-right: 0;
  border-radius: ${props => props.theme.defaultRadius};
`

const PriceSelectionDrawer: React.FC<PriceSelectionDrawerProps> = (props: PriceSelectionDrawerProps): JSX.Element => {
    const stripeBalanceRequestBag = useStripeBalance();

    if (!stripeBalanceRequestBag.response!.data) {
        return null;
    }

    return <DrawerDiv
        variants={
            {
                visible: {
                    height: 'auto'
                },
                hidden: {
                    height: 0
                }
            }
        }
        initial={'hidden'}
        animate={props.isOpen ? 'visible' : 'hidden'}
    >
        {
            stripeBalanceRequestBag.response.data.balance.available.map((curr: Currency) => (
                <CurrencyButton
                    onClick={() => {
                        props.setCurrency(curr);
                        props.setOpen(false);
                    }}
                    key={curr.currency}
                >{curr.currency.toUpperCase()} {symbolOf(curr.currency)}</CurrencyButton>
            ))
        }
    </DrawerDiv>
}

const BankName = styled.p`
  font-size: 18px;
  font-weight: 400;
`

const DefaultText = styled.span`
  font-size: 14px;
  opacity: 0.5;
`;

const Last4 = styled.p`
  margin-top: ${props => props.theme.smallSpacing};
  opacity: 0.5;
  font-size: 14px;
  font-weight: 400;
`

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

const BankAccountSelection: React.FC<BankAccountSelectionProps> = (props: BankAccountSelectionProps): JSX.Element => {

    const theme = useTheme() as Theme;

    if (props.stripeInterfaceRequestBag.response.loading || !props.currency) {
        return <FullPageLoading/>
    }

    if (props.stripeInterfaceRequestBag.response.error) {
        return <Error message={'cannot fetch interface'} retryLabel={'retry'} onRefresh={props.stripeInterfaceRequestBag.force}/>
    }

    const stripeInterface: StripeInterfaceEntity = props.stripeInterfaceRequestBag.response.data.stripe_interface;
    const accounts = stripeInterface.connect_account_external_accounts.filter(
        (acct: any) => acct.currency.toLowerCase() === props.currency
    );

    return <div
        style={{
            width: '100%',
            maxWidth: 500,
            marginTop: theme.regularSpacing
        }}
    >
        <TitleContainer>
            <BankAccountTitle>Select destination account</BankAccountTitle>
        </TitleContainer>
        {
            accounts
                .map((ext: any, idx: number) => (
                    <SelectableComponentListElement
                        selected={props.selectedAccount === idx}
                        key={`${ext.name}${idx}`}
                        onSelection={() => {
                            props.setSelectedAccount(idx)
                        }}
                    >
                        <div
                            style={{
                                padding: theme.regularSpacing
                            }}
                        >
                            <BankName>{ext.name} <DefaultText>{ext.default_for_currency ? '(default)' : ''}</DefaultText></BankName>
                            <Last4>**** **** **** {ext.last4}</Last4>
                        </div>
                    </SelectableComponentListElement>
                ))
        }
    </div>
}

const showCta = (selectedAccount: number, amount: string): boolean => {
    return !(selectedAccount === null || amount === '' || parseInt(amount, 10) < 100);
}

export const StripeWithdrawManager: React.FC<StripeWithdrawManagerProps> = (props: StripeWithdrawManagerProps): JSX.Element => {

    const [currency, setCurrency] = useState(null);
    const [currencySelectionOpen, setCurrencySelectionOpen] = useState(false);
    const [clicked, setClicked] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [amount, setAmount] = useState('');
    const stripeInterfaceRequestBag = useStripeInterface();
    const stripeBalanceRequestBag = useStripeBalance();
    const token = useSelector((state: AppState) => state.auth.token?.value);
    const [uuid] = useState(v4());
    const createStripePayoutRequest = useLazyRequest('payment.stripe.payout', uuid);
    const dispatch = useDispatch();
    const history = useHistory();

    useDeepEffect(() => {
        if (currency !== null && amount !== null && amount !== '' && amount !== '0' && clicked) {

            if (!stripeInterfaceRequestBag.response.data) {
                dispatch(PushNotification('Cannot retrieve external account info', 'error'));
                return ;
            }

            const stripeInterface = stripeInterfaceRequestBag.response.data.stripe_interface;

            const accounts = stripeInterface.connect_account_external_accounts.filter(
                (acct: any) => acct.currency.toLowerCase() === currency.currency.toLowerCase()
            );

            const account = accounts[selectedAccount];

            if (!createStripePayoutRequest.response.called) {
                createStripePayoutRequest.lazyRequest([
                    token,
                    {
                        amount: parseInt(amount, 10),
                        destination: account.id,
                        currency: currency.currency.toLowerCase(),
                    }
                ], {
                    force: true
                })
            } else {
                if (createStripePayoutRequest.response.error) {
                    setClicked(false);
                    dispatch(PushNotification(createStripePayoutRequest.response.error.message, 'error'));
                } else if (createStripePayoutRequest.response.data) {
                    dispatch(PushNotification('Payout triggered', 'success'));
                    history.goBack();
                }

            }
        }
    }, [currency, amount, clicked, selectedAccount, createStripePayoutRequest.response, token])

    useDeepEffect(() => {
        if (currency && stripeInterfaceRequestBag.response.data) {
            setSelectedAccount(
                stripeInterfaceRequestBag.response.data.stripe_interface.connect_account_external_accounts
                    .filter(
                        (acct: any): boolean => acct.currency.toLowerCase() === currency.currency.toLowerCase()
                    )
                    .findIndex(
                        (acct: any): boolean => acct.default_for_currency
                    )
            )
        }
    }, [stripeInterfaceRequestBag.response.data, currency])

    useDeepEffect(() => {
        if (stripeBalanceRequestBag.response?.data) {
            if (currency === null) {
                setCurrency(
                    stripeBalanceRequestBag.response.data.balance.available[0]
                );
            }
        }
    }, [stripeBalanceRequestBag.response.data]);

    return <Container>
        <TitleContainer>
            <WithdrawTitle>Select Amount to withdraw</WithdrawTitle>
        </TitleContainer>
        <ConfigurationContainer>
            {
                stripeBalanceRequestBag.response.error

                    ?
                    <Error message={'cannot fetch balance'} onRefresh={stripeBalanceRequestBag.force} retryLabel={'retry'}/>

                    :
                    <>
                        <PriceSelectionContainer>
                            <CurrencySelector currency={currency} setCurrency={setCurrency} isOpen={currencySelectionOpen} setOpen={setCurrencySelectionOpen}/>
                            <CurrencyValue currency={currency} amount={amount} setAmount={setAmount}/>
                        </PriceSelectionContainer>
                        <PriceIndicationsContainer>
                            <TotalBalanceIndication currency={currency}/>
                            <MaxBalanceSelector closeCurrencySelection={() => setCurrencySelectionOpen(false)} currency={currency} setAmount={setAmount}/>
                        </PriceIndicationsContainer>
                    </>
            }
        </ConfigurationContainer>
        <PriceSelectionDrawer isOpen={currencySelectionOpen} currency={currency} setCurrency={setCurrency} setOpen={setCurrencySelectionOpen}/>
        <BankAccountSelection stripeInterfaceRequestBag={stripeInterfaceRequestBag} selectedAccount={selectedAccount} setSelectedAccount={setSelectedAccount} currency={currency?.currency}/>
        <FullButtonCta onClick={() => setClicked(true)} ctaLabel={'Withdraw funds'} show={showCta(selectedAccount, amount)} variant={'primary'} loading={clicked}/>
    </Container>
}
