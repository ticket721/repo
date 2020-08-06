import React, { useState }                            from 'react';
import { Error, FullPageLoading, Icon, FullButtonCta} from '@frontend/flib-react/lib/components';
import { PasswordlessUserDto }                        from '@common/sdk/lib/@backend_nest/apps/server/src/authentication/dto/PasswordlessUser.dto';
import { useRequest }                                 from '../../hooks/useRequest';
import { v4 }                                         from 'uuid';
import { useDispatch, useSelector }                   from 'react-redux';
import { T721AppState }                               from '@frontend/t721-app/src/redux';
import { PaymentStripeFetchInterfaceResponseDto }     from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/payment/stripe/dto/PaymentStripeFetchInterfaceResponse.dto';
import { StripeInterfaceEntity }                      from '@common/sdk/lib/@backend_nest/libs/common/src/stripeinterface/entities/StripeInterface.entity';
import styled, { useTheme }                           from 'styled-components';
import { Theme }                                      from '@frontend/flib-react/lib/config/theme';
import { useCustomStripe }                            from '../../utils/useCustomStripe';
import { PushNotification }                           from '../../redux/ducks/notifications';

const StripeServiceAgreementUrl = 'https://stripe.com/legal';
const StripeConnectedAccountAgreementUrl = 'https://stripe.com/connect-account/legal';

export interface StripeSetupCreateConnectAccountManagerProps {
    user: PasswordlessUserDto;
    stripeInterface: StripeInterfaceEntity;
}
const ListContainer = styled.section`
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    width: 100%;
    h2 {
        font-weight: 300;
        font-size: 16px;
    }
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
  padding: ${props => props.theme.regularSpacing};
`;

const ContentContainer = styled.div`
  margin-top: ${props => props.theme.regularSpacing};
`;

const Title = styled.h1`

`;

const Description = styled.p`
  margin-bottom: ${props => props.theme.regularSpacing};
`;

const Agreement = styled.p`
  margin: ${props => props.theme.regularSpacing};
  font-size: 12px;
  
  a {
    color: ${props => props.theme.primaryColor.hex};
  }
`;

export const StripeSetupCreateConnectAccountManager: React.FC<StripeSetupCreateConnectAccountManagerProps> = (props: StripeSetupCreateConnectAccountManagerProps): JSX.Element => {

    const [selection, setSelection] = useState(null);
    const theme = useTheme() as Theme;
    const stripe = useCustomStripe();
    const dispatch = useDispatch();

    const createAccountToken = async () => {
        switch (stripe.platform) {
            case 'web' : {

                try {
                    const { token, error } = await stripe.stripe.createToken('account', {
                        business_type: selection,
                        tos_shown_and_accepted: true
                    });

                    if (error) {
                        dispatch(PushNotification(error.message, 'error'));
                    }


                    console.log(token);

                } catch (e) {
                    dispatch(PushNotification(e.message, 'error'));
                }

                break ;
            }
            case 'native': {
                console.log(stripe.stripe.createAccountToken);
                break ;
            }
        }
    };

    const items = [{
        value: 'individual',
        title: 'Individual'
    }, {
        value: 'company',
        title: 'Company'
    }, {
        value: 'non_profit',
        title: 'Non-Profit Organization'
    }];

    return <>
        <Container>
            <Title>
                Business type
            </Title>
            <ContentContainer>
                <Description>
                    Stripe is our payment processor and partner. In order for you to receive funds in a legal manner we need to create a Stripe Connect account for you.
                </Description>
                <Description>
                    To start creating your Stripe Connect account, you need to select your business type from the list below.
                </Description>
            </ContentContainer>
        </Container>
        <ListContainer>
            <ul className={'row'}>
                {
                    items.map(item => (
                        <Item
                            key={item.value}
                            className={selection === item.value ? 'selected' : ''}
                            onClick={() => {
                                setSelection(item.value)
                            }}
                        >
                            <h2>{item.title}</h2>
                            <CheckIcon icon={'check'} size={'12px'} color={theme.primaryColor.hex}/>
                        </Item>
                    ))
                }
            </ul>
        </ListContainer>
        {
            selection !== null

                ?
                <Agreement>By registering your account, you agree to our <a href={StripeServiceAgreementUrl}>Services Agreement</a> and the <a href={StripeConnectedAccountAgreementUrl}>Stripe Connected Account Agreement</a>.</Agreement>

                :
                null
        }
        <FullButtonCta
            show={selection !== null && !!stripe?.stripe}
            ctaLabel={'Create Account'}
            onClick={createAccountToken}
        />
    </>
};

const isConnectAccountCreated = (stripeInterface: StripeInterfaceEntity): boolean => {
    return !!stripeInterface.connect_account;
};

export interface StripeSetupManagerProps {
    user: PasswordlessUserDto;
}

export const StripeSetupManager = (props: StripeSetupManagerProps): JSX.Element => {

    const [uuid] = useState(v4());
    const { token } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value }));

    const stripeInterfaceReq = useRequest<PaymentStripeFetchInterfaceResponseDto>({
        method: 'payment.stripe.fetchInterface',
        args: [
            token,
        ],
        refreshRate: 30,
    }, uuid);

    if (stripeInterfaceReq.response.loading) {
        return <FullPageLoading/>;
    }

    if (stripeInterfaceReq.response.error || !stripeInterfaceReq.response.data.stripe_interface) {
        return <Error message={'cannot fetch stripe interface'} retryLabel={'retry'} onRefresh={stripeInterfaceReq.force}/>;
    }

    const stripeInterface: StripeInterfaceEntity = stripeInterfaceReq.response.data.stripe_interface;

    if (!isConnectAccountCreated(stripeInterface)) {
        return <StripeSetupCreateConnectAccountManager user={props.user} stripeInterface={stripeInterface}/>
    } else {
        return <p>Connect account ready</p>;
    }
};

