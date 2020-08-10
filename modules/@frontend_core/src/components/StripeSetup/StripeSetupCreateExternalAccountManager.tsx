import { PasswordlessUserDto }                   from '@common/sdk/lib/@backend_nest/apps/server/src/authentication/dto/PasswordlessUser.dto';
import { StripeInterfaceEntity }                 from '@common/sdk/lib/@backend_nest/libs/common/src/stripeinterface/entities/StripeInterface.entity';
import styled                                    from 'styled-components';
import { Dispatch }                              from 'redux';
import React, { useState }                       from 'react';
import { useDispatch, useSelector }              from 'react-redux';
import { AppState }                              from '@frontend-core/redux';
import { v4 }                                    from 'uuid';
import { Country }                               from '../../utils/countries';
import { PushNotification }                      from '../../redux/ducks/notifications';
import { StripeSDK, useCustomStripe }            from '../../utils/useCustomStripe';
import { useLazyRequest }                        from '../../hooks/useLazyRequest';
import { useDeepEffect }                         from '../../hooks/useDeepEffect';
import { FullButtonCta, SelectInput, TextInput } from '@frontend/flib-react/lib/components';
import './StripeSetupCreateExternalAccountManager.locales';
import { useTranslation }                        from 'react-i18next';
import { CtaMargin }                             from '../../utils/CtaMargin';
import { TopNavMargin }                          from '../../utils/TopNavMargin';

export interface StripeSetupManagerCreateExternalAccountProps {
    user: PasswordlessUserDto;
    stripeInterface: StripeInterfaceEntity;
    forceFetchInterface: () => void;
}

const Container = styled.div`
  padding: ${props => props.theme.regularSpacing};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const ContentContainer = styled.div`
  margin-top: ${props => props.theme.regularSpacing};
`;

const Title = styled.h1`

`;

const Description = styled.p`
  margin-bottom: ${props => props.theme.regularSpacing};
`;

const InputContainer = styled.div`
  padding: ${props => props.theme.regularSpacing} 0px;
`;

const BankAccountForm = styled.form`
  width: 100%;
  max-width: 500px;
`;

const CountriesOptions = Object.keys(Country).filter((countryOrNum: string) => {
    return (isNaN(parseInt(countryOrNum, 10)))
}).map((key: string) => ({
    value: Country[key],
    label: key.replace( /([A-Z])/g, ' $1' )
}));

const CurrenciesOptions = [{
    label: 'EURO',
    value: 'EUR',
}, {
    label: 'USD',
    value: 'USD',
}];

const canCreateAccount = (...args: any[]): boolean => {
    return args.filter((elem) => !elem).length === 0;
};

const generateBankAccountToken = async (
    stripe: StripeSDK,
    dispatch: Dispatch,
    name: string,
    country: string,
    currency: string,
    iban: string,
    routingNumber: string,
): Promise<any> => {
    switch (stripe.platform) {

        case 'web' : {

            try {
                const { token, error } = await stripe.stripe.createToken('bank_account', {
                    country,
                    account_holder_name: name,
                    currency,
                    account_number: iban,
                    routing_number: routingNumber,
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

                const { bank_account, error } = await stripe.stripe.createBankAccountToken({
                    country,
                    account_holder_name: name,
                    currency,
                    account_number: iban,
                    routing_number: routingNumber,
                });

                if (error) {
                    dispatch(PushNotification(error.message, 'error'));
                    throw error;
                }

                return bank_account;

            } catch (e) {
                dispatch(PushNotification(e.message, 'error'));
                throw e;
            }
        }
    }
};

export const StripeSetupCreateExternalAccountManager: React.FC<StripeSetupManagerCreateExternalAccountProps> =
    CtaMargin(
        TopNavMargin(
            (props: StripeSetupManagerCreateExternalAccountProps): JSX.Element => {

                const [name, setName] = useState(undefined);
                const [country, setCountry] = useState(undefined);
                const [currency, setCurrency] = useState(undefined);
                const [iban, setIban] = useState(undefined);
                const [routingNumber, setRoutingNumber] = useState(undefined);
                const stripe = useCustomStripe();
                const dispatch = useDispatch();
                const token = useSelector((state: AppState) => state.auth.token?.value);
                const [uuid] = useState(v4());
                const addExternalAccountLazyRequest = useLazyRequest('payment.stripe.addExternalAccount', uuid);
                const [called, setCalled] = useState(false);
                const [t] = useTranslation('stripe_setup_create_external_account_manager');

                const createBankAccountToken = async () => {
                    setCalled(true);
                    try {
                        const bankAccountToken = await generateBankAccountToken(stripe, dispatch, name, country, currency, iban, routingNumber);

                        if (!addExternalAccountLazyRequest.response.called) {
                            addExternalAccountLazyRequest.lazyRequest([
                                token,
                                {
                                    bank_account_token: bankAccountToken.id,
                                },
                            ]);
                        }
                    } catch (e) {
                        setCalled(false);
                    }

                };

                useDeepEffect(() => {
                    if (called) {

                        if (addExternalAccountLazyRequest.response.called &&
                            !addExternalAccountLazyRequest.response.loading) {
                            if (addExternalAccountLazyRequest.response.error) {
                                setCalled(false);
                                dispatch(PushNotification(addExternalAccountLazyRequest.response.error.message, 'error'));
                            } else {
                                props.forceFetchInterface();
                            }
                        }

                    }

                }, [
                    called,
                    addExternalAccountLazyRequest.response,
                ]);

                return <Container>
                    <Title>{t('title')}</Title>
                    <ContentContainer>
                        <Description>{t('description')}</Description>
                    </ContentContainer>
                    <BankAccountForm>
                        <InputContainer>
                            <TextInput
                                name={'account_holder'}
                                label={t('account_holder_label')}
                                placeholder={t('account_holder_placeholder')}
                                onChange={(ev) => setName(ev.target.value)}
                            />
                        </InputContainer>
                        <InputContainer>
                            <SelectInput
                                label={t('country_label')}
                                options={CountriesOptions}
                                placeholder={t('country_placeholder')}
                                onChange={(opt) => setCountry(opt.value)}
                            />
                        </InputContainer>
                        <InputContainer>
                            <SelectInput
                                label={t('currency_label')}
                                options={CurrenciesOptions}
                                placeholder={t('currency_placeholder')}
                                onChange={(opt) => setCurrency(opt.value)}
                            />
                        </InputContainer>
                        <InputContainer>
                            <TextInput
                                name={'account_number'}
                                label={t('account_number_label')}
                                options={{
                                    blocks: [4, 4, 4, 4, 4, 4, 4],
                                    uppercase: true,
                                }}
                                placeholder={t('account_number_placeholder')}
                                onChange={(ev) => setIban(ev.target.value.split(' ').join(''))}
                            />
                        </InputContainer>
                        <InputContainer>
                            <TextInput
                                name={'routing_number'}
                                label={t('routing_number_label')}
                                options={{
                                    blocks: [9],
                                    uppercase: true,
                                }}
                                placeholder={t('routing_number_placeholder')}
                                onChange={(ev) => setRoutingNumber(ev.target.value === '' ? undefined : ev.target.value)}
                            />
                        </InputContainer>
                    </BankAccountForm>
                    <FullButtonCta
                        loading={called}
                        show={canCreateAccount(name, country, currency, iban)}
                        ctaLabel={called ? t('adding_bank_account') : t('add_bank_account')}
                        onClick={createBankAccountToken}
                    />
                </Container>;
            }
        )
    );
