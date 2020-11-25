import { PasswordlessUserDto } from '@common/sdk/lib/@backend_nest/apps/server/src/authentication/dto/PasswordlessUser.dto';
import { StripeInterfaceEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/stripeinterface/entities/StripeInterface.entity';
import styled, { useTheme } from 'styled-components';
import { FullButtonCta, Icon, SelectInput } from '@frontend/flib-react/lib/components';
import axios, { Method } from 'axios';
import { getEnv } from '../../utils/getEnv';
import qs from 'qs';
import { useCustomStripe } from '../../utils/useCustomStripe';
import { Dispatch } from 'redux';
import { PushNotification } from '../../redux/ducks/notifications';
import React, { useState } from 'react';
import { Theme } from '@frontend/flib-react/lib/config/theme';
import { useDispatch } from 'react-redux';
import { useToken } from '../../hooks/useToken';
import { v4 } from 'uuid';
import { useLazyRequest } from '../../hooks/useLazyRequest';
import { useDeepEffect } from '../../hooks/useDeepEffect';
import { useTranslation } from 'react-i18next';
import './StripeSetupCreateConnectAccountManager.locales';
import { CtaMargin } from '../../utils/CtaMargin';
import { TopNavMargin } from '../../utils/TopNavMargin';
import { InvisibleStatusBarMargin } from '../../utils/InvisibleStatusBarMargin';
import { currencies, symbolOf } from '@common/global';
import { StripeSDK } from '../../utils/StripeSDKContext';
import { useHaptics, HapticsImpactStyle } from '../../utils/useHaptics';

const StripeServiceAgreementUrl = 'https://stripe.com/legal';
const StripeConnectedAccountAgreementUrl = 'https://stripe.com/connect-account/legal';
const StripeNativeEndpointUrl = 'https://api.stripe.com/v1';

export interface StripeSetupCreateConnectAccountManagerProps {
    user: PasswordlessUserDto;
    stripeInterface: StripeInterfaceEntity;
    forceFetchInterface: () => void;
}

const ListContainer = styled.section`
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    width: 100%;
    max-width: 500px;
    h2 {
        font-weight: 300;
        font-size: 16px;
    }
`;

const SubTitleContainer = styled.div`
    text-align: start;
    margin-top: ${(props) => props.theme.regularSpacing};
    padding: ${(props) => props.theme.regularSpacing};
    width: 100%;
    max-width: 500px;
`;

const SubTitle = styled.span`
    margin: 0;
    text-transform: uppercase;
    font-size: 14px;
    font-weight: 500;
    opacity: 0.6;
`;

const CheckIcon = styled(Icon)`
    height: 12px;
    margin-left: auto;
    opacity: 0;
    transition: opacity 300ms ease;
`;

const Item = styled.li`
    align-items: center;
    background-color: ${(props) => props.theme.componentColor};
    cursor: pointer;
    display: flex;
    font-size: 14px;
    font-weight: 500;
    padding: ${(props) => props.theme.regularSpacing} ${(props) => props.theme.biggerSpacing};
    transition: background-color 300ms ease;
    width: 100%;
    border-bottom: 1px solid ${(props) => props.theme.componentColorLight};

    &:last-child {
        border-bottom: none;
    }

    &.selected {
        background-color: ${(props) => props.theme.componentColorLighter};

        ${CheckIcon} {
            opacity: 1;
        }
    }
`;

const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const Title = styled.h1`
    padding: ${(props) => props.theme.regularSpacing};
    margin: 0;
`;

const Agreement = styled.p`
    margin: ${(props) => props.theme.regularSpacing};
    margin-top: ${(props) => props.theme.bigSpacing};
    font-size: 12px;

    a {
        color: ${(props) => props.theme.primaryColor.hex};
    }
`;

const createAccountTokenPlaceholder = (selection: string): Promise<any> => {
    const options = {
        method: 'post' as Method,
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            authorization: `Bearer ${getEnv().REACT_APP_STRIPE_API_KEY}`,
        },
        data: qs.stringify({
            account: {
                tos_shown_and_accepted: true,
                business_type: selection,
            },
        }),
        url: `${StripeNativeEndpointUrl}/tokens`,
    };

    return axios(options);
};

const generateAccountToken = async (stripe: StripeSDK, selection: string, dispatch: Dispatch): Promise<any> => {
    switch (stripe.platform) {
        case 'web': {
            try {
                const { token, error } = await stripe.stripe.createToken('account', {
                    business_type: selection,
                    tos_shown_and_accepted: true,
                });

                if (error) {
                    throw error;
                }

                return token;
            } catch (e) {
                dispatch(PushNotification(e.message, 'error'));
                throw e;
            }
        }
        case 'native': {
            try {
                const res = await createAccountTokenPlaceholder(selection);

                return res.data;
            } catch (e) {
                dispatch(PushNotification(e.message, 'error'));
                throw e;
            }
        }
    }
};

const CurrencySelectInput = styled(SelectInput)`
    width: 100%;
`;

const CurrencySelectInputContainer = styled.div`
    width: 100%;
    max-width: 500px;
    padding-left: ${(props) => props.theme.regularSpacing};
    padding-right: ${(props) => props.theme.regularSpacing};
`;

const currenciesSelectOptions = currencies.map((curr: any) => ({
    label: `${curr.description} (${symbolOf(curr.code)})`,
    value: curr.code.toLowerCase(),
}));

export const StripeSetupCreateConnectAccountManager: React.FC<StripeSetupCreateConnectAccountManagerProps> = CtaMargin(
    TopNavMargin(
        InvisibleStatusBarMargin(
            (props: StripeSetupCreateConnectAccountManagerProps): JSX.Element => {
                const [selection, setSelection] = useState(null);
                const [currency, setCurrency] = useState(null);
                const theme = useTheme() as Theme;
                const stripe = useCustomStripe();
                const dispatch = useDispatch();
                const token = useToken();
                const [uuid] = useState(v4());
                const createStripeInterfaceLazyRequest = useLazyRequest('payment.stripe.createConnectAccount', uuid);
                const [called, setCalled] = useState(false);
                const [t] = useTranslation('stripe_setup_create_connect_account_manager');
                const haptics = useHaptics();

                const createAccountToken = async () => {
                    setCalled(true);
                    haptics.impact({
                        style: HapticsImpactStyle.Light,
                    });
                    try {
                        const accountToken = await generateAccountToken(stripe, selection, dispatch);
                        if (!createStripeInterfaceLazyRequest.response.called) {
                            createStripeInterfaceLazyRequest.lazyRequest([
                                token,
                                {
                                    account_token: accountToken.id,
                                    currency,
                                },
                            ]);
                        }
                    } catch (e) {
                        setCalled(false);
                    }
                };

                useDeepEffect(() => {
                    if (called) {
                        if (
                            createStripeInterfaceLazyRequest.response.called &&
                            !createStripeInterfaceLazyRequest.response.loading
                        ) {
                            if (createStripeInterfaceLazyRequest.response.error) {
                                setCalled(false);
                                dispatch(
                                    PushNotification(createStripeInterfaceLazyRequest.response.error.message, 'error'),
                                );
                            } else {
                                props.forceFetchInterface();
                            }
                        }
                    }
                }, [called, createStripeInterfaceLazyRequest.response]);

                const items = [
                    {
                        value: 'individual',
                        title: t('individual'),
                    },
                    {
                        value: 'company',
                        title: t('company'),
                    },
                    {
                        value: 'non_profit',
                        title: t('non_profit'),
                    },
                ];

                return (
                    <>
                        <Container>
                            <Title>{t('title')}</Title>
                            <SubTitleContainer>
                                <SubTitle>{t('type_title')}</SubTitle>
                            </SubTitleContainer>
                            <ListContainer>
                                <ul className={'row'}>
                                    {items.map((item) => (
                                        <Item
                                            key={item.value}
                                            className={selection === item.value ? 'selected' : ''}
                                            onClick={() => {
                                                haptics.impact({
                                                    style: HapticsImpactStyle.Light,
                                                });
                                                setSelection(item.value);
                                            }}
                                        >
                                            <h2>{item.title}</h2>
                                            <CheckIcon icon={'check'} size={'12px'} color={theme.primaryColor.hex} />
                                        </Item>
                                    ))}
                                </ul>
                            </ListContainer>
                            {selection !== null ? (
                                <>
                                    <SubTitleContainer>
                                        <SubTitle>{t('currency_title')}</SubTitle>
                                    </SubTitleContainer>
                                    <CurrencySelectInputContainer>
                                        <CurrencySelectInput
                                            options={currenciesSelectOptions}
                                            onChange={(opt: any) => {
                                                haptics.impact({
                                                    style: HapticsImpactStyle.Light,
                                                });
                                                setCurrency(opt[0].value);
                                            }}
                                        />
                                    </CurrencySelectInputContainer>
                                </>
                            ) : null}
                            <div style={{ maxWidth: 500 }}>
                                {selection !== null && currency !== null ? (
                                    <Agreement>
                                        {t('agreement_first_part')}
                                        <a href={StripeServiceAgreementUrl}>{t('services_agreement')}</a>
                                        {t('agreement_second_part')}
                                        <a href={StripeConnectedAccountAgreementUrl}>
                                            {t('stripe_connected_account_agreement')}
                                        </a>
                                        .
                                    </Agreement>
                                ) : null}
                            </div>
                        </Container>
                        <FullButtonCta
                            show={selection !== null && currency !== null && !!stripe?.stripe}
                            ctaLabel={called ? t('creating_account') : t('create_account')}
                            onClick={createAccountToken}
                            loading={called}
                        />
                    </>
                );
            },
        ),
    ),
);
