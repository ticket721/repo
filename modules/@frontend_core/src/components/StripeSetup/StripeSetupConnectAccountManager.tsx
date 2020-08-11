import { PasswordlessUserDto }                             from '@common/sdk/lib/@backend_nest/apps/server/src/authentication/dto/PasswordlessUser.dto';
import { StripeInterfaceEntity, ConnectAccountCapability } from '@common/sdk/lib/@backend_nest/libs/common/src/stripeinterface/entities/StripeInterface.entity';
import React, { useState }     from 'react';
import styled, { useTheme }    from 'styled-components';
import { Button, SelectInput, Icon } from '@frontend/flib-react/lib/components';
import { useTranslation }           from 'react-i18next';
import { Theme }                    from '@frontend/flib-react/lib/config/theme';
import './StripeSetupConnectAccountCapabilitiesManager.locales';
import './StripeSetupConnectAccountRequirementsManager.locales';
import { v4 }                       from 'uuid';
import { useDispatch, useSelector } from 'react-redux';
import { AppState }                 from '../../redux';
import { useLazyRequest }           from '../../hooks/useLazyRequest';
import { getEnv }                   from '../../utils/getEnv';
import { useDeepEffect }            from '../../hooks/useDeepEffect';
import { open }                     from '../../utils/inAppBrowser';
import { PushNotification }         from '../../redux/ducks/notifications';

// tslint:disable-next-line
const getSymbolFromCurrency = require('currency-symbol-map');


export interface StripeSetupConnectAccountManagerProps {
    user: PasswordlessUserDto;
    stripeInterface: StripeInterfaceEntity;
    forceFetchInterface: () => void;
}

const BalanceContainerPlaceholder = styled.div`
  height: calc(30vh + env(safe-area-inset-top));
  height: calc(30vh + constant(safe-area-inset-top));
  margin-top: - env(safe-area-inset-top);
  margin-top: - constant(safe-area-inset-top);
  background-color: red;
`;

const BalanceContainer = styled.div`
  width: 100vw;
  height: calc(30vh + env(safe-area-inset-top));
  height: calc(30vh + constant(safe-area-inset-top));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  z-index: 10;
  background-color: #120f1a;
  box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
`;

const MenuContainer = styled.div`
  min-height: calc(70vh - env(safe-area-inset-top));
  min-height: calc(70vh - constant(safe-area-inset-top));
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  padding-bottom: calc(16px + constant(safe-area-inset-bottom));
  background-color: ${props => props.theme.componentColor};
  z-index: 1;
`;

const fakeBalance = {
    "object": "balance",
    "available": [
        {
            "amount": 100,
            "currency": "eur",
            "source_types": {
                "card": 100
            }
        },
        {
            "amount": 20,
            "currency": "usd",
            "source_types": {
                "card": 20
            }
        }
    ],
    "livemode": false,
    "pending": [
        {
            "amount": 200,
            "currency": "eur",
            "source_types": {
                "card": 200
            }
        },
        {
            "amount": 30,
            "currency": "usd",
            "source_types": {
                "card": 30
            }
        }
    ]
};

interface BalanceCurrencyInfo {
    amount: number;
    pending: number;
    currency: string;
}

interface StripeSetupConnectAccountBalanceManagerProps {
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
  margin-bottom: ${props => props.theme.smallSpacing};
  font-size: 30px;
`;

interface BalancePendingTextProps {
    visible: boolean;
}

const BalancePendingText = styled.h3<BalancePendingTextProps>`
  opacity: ${props => props.visible ? '0.85' : '0'};
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
`;

const recoverHighestBalance = (balances: BalanceCurrencyInfo[]): string => {

    if (balances.length === 0) {
        return 'eur';
    }

    return balances.sort((a: BalanceCurrencyInfo, b: BalanceCurrencyInfo) => (b.amount + b.pending) - (a.amount + a.pending))[0].currency;
};

const getCurrency = (currency: string, balances: BalanceCurrencyInfo[]): BalanceCurrencyInfo => {
    if (balances.length === 0) {
        return {
            currency: 'eur',
            amount: 0,
            pending: 0
        }
    }

    return balances[balances.findIndex((b: BalanceCurrencyInfo) => b.currency === currency)];
};

const formatAmount = (locale: string, currency: string, amount: number): string => {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount / 100)
};

const StripeSetupConnectAccountBalanceManager: React.FC<StripeSetupConnectAccountBalanceManagerProps> = (props: StripeSetupConnectAccountBalanceManagerProps): JSX.Element => {

    const [currency, setCurrency] = useState(recoverHighestBalance(props.currencies));
    const [, i18n] = useTranslation('language');

    const currenciesOptions = props.currencies.length

        ?
        props.currencies.map((curr: BalanceCurrencyInfo) => ({
            label: `${getSymbolFromCurrency(curr.currency)} ${curr.currency.toUpperCase()}`,
            value: curr.currency
        }))

        :
        [{
            label: `${getSymbolFromCurrency('eur')} EUR`,
            value: 'eur'
        }];

    const selectedIdx = currenciesOptions.findIndex((opt: any) => opt.value === currency);

    return <>
        <div style={{height: '48px'}}/>
        <BalanceTextContainer>
            <BalanceAvailableText>{formatAmount(i18n.language, currency, getCurrency(currency, props.currencies).amount)}</BalanceAvailableText>
            <BalancePendingText visible={true}>{formatAmount(i18n.language, currency, getCurrency(currency, props.currencies).pending)} pending</BalancePendingText>
        </BalanceTextContainer>
        <BalanceButtonsContainer>
            <BalanceCurrency
                value={[currenciesOptions[selectedIdx]]}
                options={currenciesOptions}
                searchable={false}
                onChange={(curr: any) => setCurrency(curr.value)}
            />
            <BalanceButton title={'Withdraw'} variant={'disabled'}/>
        </BalanceButtonsContainer>
    </>;
};

const fusionBalances = (stripeBalances: any): BalanceCurrencyInfo[] => {
    const currencies: {[key: string]: BalanceCurrencyInfo} = {};

    for (const availableCurrency of stripeBalances.available) {
        currencies[availableCurrency.currency] = {
            currency: availableCurrency.currency,
            amount: availableCurrency.amount,
            pending: 0
        }
    }

    for (const pendingCurrency of stripeBalances.pending) {
        if (currencies[pendingCurrency.currency]) {
            currencies[pendingCurrency.currency].pending = pendingCurrency.amount;
        } else {
            currencies[pendingCurrency.currency] = {
                currency: pendingCurrency.currency,
                amount: 0,
                pending: pendingCurrency.amount
            }
        }
    }

    return Object.keys(currencies).map((currency: string): BalanceCurrencyInfo => currencies[currency]);
};

const SectionHeader = styled.div`
  background-color: ${props => props.theme.darkBg};
  height: 50px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  
  & > span {
    font-size: 18px;
    font-weight: 500;
    margin-left: ${props => props.theme.regularSpacing};
  }
`;

interface SectionElementContainerProps {
    clickable?: boolean;
}

const SectionElementContainer = styled.div<SectionElementContainerProps>`
  max-width: 500px;
  background-color: ${props => props.theme.componentColor};
  padding: ${props => props.theme.regularSpacing}; 
  margin: ${props => props.theme.regularSpacing}; 
  border-radius: ${props => props.theme.defaultRadius};
  box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
`;

const CapabilityTitle = styled.h3`
  font-size: 16px;
  font-weight: 400;
`;

interface StatusTextProps {
    color: string;
}

const StatusText = styled.h3<StatusTextProps>`
  font-size: 16px;
  font-weight: 400;
  color: ${props => props.color};
`;

const FieldTitle = styled.h4`
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  opacity: 0.3;
  margin-bottom: 4px;
`;

const FieldContainer = styled.div`

`;

const FieldsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export interface StripeSetupConnectAccountCapabilitiesManagerProps {
    capabilities: ConnectAccountCapability[];
}

const CapabilitiesStatusMapping = {
    inactive: 'error',
    active: 'success',
    pending: 'warning'
};

const colorFromStatus = (theme: Theme, status: string): string => {
    switch (status) {
        case 'warning': return theme.warningColor.hex;
        case 'success': return theme.successColor.hex;
        case 'error': return theme.errorColor.hex;
        default: return theme.textColor;
    }
};

const StatusIcon = (props: {status: string}): JSX.Element => {
    let char;

    switch (props.status) {
        case 'warning': {
            char = '○';
            break ;
        }
        case 'error': {
            char = '⦿';
            break ;
        }
        case 'success': {
            char = '✔';
            break ;
        }
        default: {
            char = '⦾';
            break ;
        }
    }

    return <span style={{fontSize: 16, marginLeft: 5}}>{char}</span>;
}

export const StripeSetupConnectAccountCapabilitiesManager: React.FC<StripeSetupConnectAccountCapabilitiesManagerProps> = (props: StripeSetupConnectAccountCapabilitiesManagerProps): JSX.Element => {

    const [t] = useTranslation('stripe_setup_capabilities');
    const theme = useTheme() as Theme;

    const elements = props.capabilities.map((cap: ConnectAccountCapability, idx: number) => <SectionElementContainer key={`${cap.name}${idx}`}>
        <FieldsContainer>
            <FieldContainer>
                <FieldTitle>
                    {t('name')}
                </FieldTitle>
                <CapabilityTitle>
                    {t(`name__${cap.name}`)}
                </CapabilityTitle>
            </FieldContainer>
            <FieldContainer>
                <FieldTitle>
                    {t('status')}
                </FieldTitle>
                <StatusText color={colorFromStatus(theme, CapabilitiesStatusMapping[cap.status])}>
                    {t(`status__${cap.status}`)}
                    <StatusIcon status={CapabilitiesStatusMapping[cap.status]}/>
                </StatusText>
            </FieldContainer>
        </FieldsContainer>
    </SectionElementContainer>);

    return <>
        <SectionHeader>
            <span>{t('title')}</span>
        </SectionHeader>
        {
            elements
        }
    </>
};

export interface StripeSetupConnectAccountRequirementsManagerProps {
    stripeInterface: StripeInterfaceEntity;
    forceRefresh: () => void;
}

const RequirementsStatusMapping = {
    connect_account_currently_due: 'error',
    connect_account_eventually_due: 'warning',
    connect_account_past_due: 'warning',
    connect_account_pending_verification: 'warning',
}

const isAccountReady = (stripeInterface: StripeInterfaceEntity): boolean => {
    return !stripeInterface.connect_account_disabled_reason;
}

export const StripeSetupConnectAccountRequirementsManager: React.FC<StripeSetupConnectAccountRequirementsManagerProps> = (props: StripeSetupConnectAccountRequirementsManagerProps): JSX.Element => {

    const [t] = useTranslation('stripe_setup_requirements');
    const theme = useTheme() as Theme;
    const [uuid, setUUID] = useState(v4());
    const { token } = useSelector((state: AppState) => ({ token: state.auth.token?.value }));
    const generateOnboardingUrlLazyRequest = useLazyRequest('payment.stripe.generateOnboardingUrl', uuid);
    const generateUpdateUrlLazyRequest = useLazyRequest('payment.stripe.generateUpdateUrl', uuid);
    const [called, setCalled] = useState(false);
    const dispatch = useDispatch();

    const onOnboardingClick = () => {
        setCalled(true);
        generateOnboardingUrlLazyRequest.lazyRequest([
            token, {
                refresh_url: `${getEnv().REACT_APP_SELF}/_/redirect/close?message=account_link_refresh`,
                return_url: `${getEnv().REACT_APP_SELF}/_/redirect/close?message=account_link_return`
            },
            uuid /* tick to ensure each cache is new */
        ], {
            force: true
        })
    };

    const onUpdateClick = () => {
        setCalled(true);
        generateUpdateUrlLazyRequest.lazyRequest([
            token, {
                refresh_url: `${getEnv().REACT_APP_SELF}/_/redirect/close?message=account_link_refresh`,
                return_url: `${getEnv().REACT_APP_SELF}/_/redirect/close?message=account_link_return`
            },
            uuid /* tick to ensure each cache is new */
        ], {
            force: true
        })
    };

    useDeepEffect(() => {

        if (called && generateUpdateUrlLazyRequest.response.called) {
            if (generateUpdateUrlLazyRequest.response.data) {
                const url = (generateUpdateUrlLazyRequest.response.data as any).url;

                open(url, 'Stripe', props.forceRefresh)
                    .then(() => {
                        console.log(`Opened ${url}`);
                    })
                    .catch((e: Error) => {
                        dispatch(PushNotification(e.message, 'error'));
                    });
                setCalled(false);
                setUUID(v4());

            } else if (generateUpdateUrlLazyRequest.response.error) {
                dispatch(PushNotification(generateUpdateUrlLazyRequest.response.error.message, 'error'));
            }
        }

    }, [called, generateUpdateUrlLazyRequest.response, props]);

    useDeepEffect(() => {

        if (called && generateOnboardingUrlLazyRequest.response.called) {
            if (generateOnboardingUrlLazyRequest.response.data) {
                const url = (generateOnboardingUrlLazyRequest.response.data as any).url;

                open(url, 'Stripe', props.forceRefresh)
                    .then(() => {
                        console.log(`Opened ${url}`);
                    })
                    .catch((e: Error) => {
                        console.error(e);
                    });
                setCalled(false);
                setUUID(v4());

            } else if (generateOnboardingUrlLazyRequest.response.error) {
                dispatch(PushNotification(generateOnboardingUrlLazyRequest.response.error.message, 'error'));
            }
        }

    }, [called, generateOnboardingUrlLazyRequest.response, props]);

    if (isAccountReady(props.stripeInterface)) {
        return <>
            <SectionHeader>
                <span>{t('title')}</span>
            </SectionHeader>
            <SectionElementContainer onClick={onUpdateClick}>
                <FieldsContainer>
                    <FieldContainer>
                        <FieldTitle>
                            {t(`document_ready`)}
                        </FieldTitle>
                        <CapabilityTitle>
                            Up to date
                        </CapabilityTitle>
                    </FieldContainer>
                    <FieldContainer>
                        <FieldTitle>
                            {t('status')}
                        </FieldTitle>
                        <StatusText color={colorFromStatus(theme, 'success')}>
                            {t(`status_ready`)}
                            <StatusIcon status={'success'}/>
                        </StatusText>
                    </FieldContainer>
                </FieldsContainer>
                <FieldsContainer style={{marginTop: 12, justifyContent: 'flex-end'}}>
                <span style={{fontSize: 14, opacity: 0.4}}>
                    {t(`click_to_update`)}
                </span>
                </FieldsContainer>
            </SectionElementContainer>
        </>;
    }

    const reason = `connect_account_${props.stripeInterface.connect_account_disabled_reason.split('.')[1]}`;
    const requirements = props.stripeInterface[reason];

    return <>
        <SectionHeader>
            <span>{t('title')}</span>
        </SectionHeader>
        <SectionElementContainer onClick={onOnboardingClick}>
            <FieldsContainer>
                <FieldContainer>
                    <FieldTitle>
                        {t(`document__${reason}`)}
                    </FieldTitle>
                    <CapabilityTitle>
                        {requirements.length} missing
                    </CapabilityTitle>
                </FieldContainer>
                <FieldContainer>
                    <FieldTitle>
                        {t('status')}
                    </FieldTitle>
                    <StatusText color={colorFromStatus(theme, RequirementsStatusMapping[reason])}>
                        {t(`status__${reason}`)}
                        <StatusIcon status={RequirementsStatusMapping[reason]}/>
                    </StatusText>
                </FieldContainer>
            </FieldsContainer>
            <FieldsContainer style={{marginTop: 12, justifyContent: 'flex-end'}}>
                <span style={{fontSize: 14, opacity: 0.4}}>
                    {t(`click_to_fill`)}

                </span>
            </FieldsContainer>
        </SectionElementContainer>
    </>
};

const GlobalContainer = styled.div`
  height: 100vh;
`;

interface VeilContainerProps {
    visible: boolean;
}

const VeilContainer = styled.div<VeilContainerProps>`
  opacity: ${props => props.visible ? '1' : '0.3'};
`;

const RefreshIcon = styled(Icon)`
  position: fixed;
  top: calc(16px + env(safe-area-inset-top));
  top: calc(16px + constant(safe-area-inset-top));
  right: 24px;
  z-index: 10000;
`;

export const StripeSetupConnectAccountManager: React.FC<StripeSetupConnectAccountManagerProps> = (props: StripeSetupConnectAccountManagerProps): JSX.Element => {

    return <GlobalContainer>
        <BalanceContainer>
            <StripeSetupConnectAccountBalanceManager currencies={fusionBalances(fakeBalance)}/>
        </BalanceContainer>
        <RefreshIcon color={'white'} icon={'refresh'} size={16} onClick={props.forceFetchInterface}/>
        <BalanceContainerPlaceholder/>
        <MenuContainer>
            <StripeSetupConnectAccountRequirementsManager stripeInterface={props.stripeInterface} forceRefresh={props.forceFetchInterface}/>
            <VeilContainer visible={isAccountReady(props.stripeInterface)}>
                <StripeSetupConnectAccountCapabilitiesManager capabilities={props.stripeInterface.connect_account_capabilities || []}/>
            </VeilContainer>
        </MenuContainer>
    </GlobalContainer>;
};

