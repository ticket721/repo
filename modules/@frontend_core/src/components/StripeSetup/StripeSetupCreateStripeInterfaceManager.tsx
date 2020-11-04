import React, { useState } from 'react';
import { Button } from '@frontend/flib-react/lib/components';
import { useTranslation } from 'react-i18next';
import { TopNavMargin } from '../../utils/TopNavMargin';
import { InvisibleStatusBarMargin } from '../../utils/InvisibleStatusBarMargin';
import styled from 'styled-components';
import './StripeSetupCreateStripeInterfaceManager.locales';
import { useToken } from '../../hooks/useToken';
import { useDispatch } from 'react-redux';
import { v4 } from 'uuid';
import { useLazyRequest } from '../../hooks/useLazyRequest';
import { useDeepEffect } from '../../hooks/useDeepEffect/index';
import { PushNotification } from '../../redux/ducks/notifications/actions';

const Container = styled.div`
    padding: ${(props) => props.theme.regularSpacing};
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const ContentContainer = styled.div`
    margin-top: ${(props) => props.theme.regularSpacing};
    max-width: 500px;
`;

const Title = styled.h1``;

const Description = styled.p`
    margin-bottom: ${(props) => props.theme.regularSpacing};
`;

export interface StripeSetupCreateStripeInterfaceManagerProps {
    forceFetchInterface: () => void;
}

export const StripeSetupCreateStripeInterfaceManager: React.FC<StripeSetupCreateStripeInterfaceManagerProps> = TopNavMargin(
    InvisibleStatusBarMargin((props: StripeSetupCreateStripeInterfaceManagerProps) => {
        const [t] = useTranslation('stripe_setup_create_stripe_interface_manager');
        const token = useToken();
        const [uuid, setUUID] = useState(v4());
        const stripeInterfaceLazyRequest = useLazyRequest('payment.stripe.createInterface', uuid);
        const dispatch = useDispatch();

        const onClick = () => {
            stripeInterfaceLazyRequest.lazyRequest([token], {
                force: true,
            });
        };

        useDeepEffect(() => {
            if (stripeInterfaceLazyRequest.response.called && !stripeInterfaceLazyRequest.response.loading) {
                if (stripeInterfaceLazyRequest.response.error) {
                    dispatch(
                        PushNotification(stripeInterfaceLazyRequest.response.error.response.data.message, 'error'),
                    );
                    setUUID(v4());
                } else if (stripeInterfaceLazyRequest.response.data) {
                    console.log(stripeInterfaceLazyRequest.response.data);
                    props.forceFetchInterface();
                }
            }
        }, [stripeInterfaceLazyRequest.response]);

        return (
            <Container>
                <Title>{t('title')}</Title>
                <ContentContainer>
                    <Description>{t('description')}</Description>
                </ContentContainer>
                <Button
                    onClick={onClick}
                    title={t('get_started')}
                    variant={'primary'}
                    loadingState={stripeInterfaceLazyRequest.response.loading}
                    style={{ maxWidth: '500px' }}
                />
            </Container>
        );
    }),
);
