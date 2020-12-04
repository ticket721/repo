import { StripeInterfaceEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/stripeinterface/entities/StripeInterface.entity';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
import { Theme } from '@frontend/flib-react/lib/config/theme';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { v4 } from 'uuid';
import { open } from '../../../utils/inAppBrowser';
import {
    FieldContainer,
    FieldsContainer,
    FieldTitle,
    SectionElementContainer,
    SectionHeader,
} from './StripeMenuSections';
import { colorFromStatus, StatusIcon, StatusText } from './StatusUtils';
import { getEnv } from '../../../utils/getEnv';
import { useToken } from '../../../hooks/useToken';
import { useLazyRequest } from '../../../hooks/useLazyRequest/index';
import { PushNotification } from '../../../redux/ducks/notifications/actions';
import { useDeepEffect } from '../../../hooks/useDeepEffect/index';
import { isAccountReady } from './isAccountReady';
import './SSCARequirementsManager.locales';
import { HapticsImpactStyle, useHaptics } from '../../../hooks/useHaptics';

export interface SSCARequirementsManagerProps {
    stripeInterface: StripeInterfaceEntity;
    forceRefresh: () => void;
}

const RequirementsStatusMapping = {
    connect_account_currently_due: 'error',
    connect_account_eventually_due: 'warning',
    connect_account_past_due: 'warning',
    connect_account_pending_verification: 'warning',
};

const RequirementTitle = styled.h3`
    font-size: 16px;
    font-weight: 400;
`;

export const SSCARequirementsManager: React.FC<SSCARequirementsManagerProps> = (
    props: SSCARequirementsManagerProps,
): JSX.Element => {
    const [t] = useTranslation('stripe_setup_requirements');
    const theme = useTheme() as Theme;
    const [uuid, setUUID] = useState(v4());
    const token = useToken();
    const haptics = useHaptics();
    const generateOnboardingUrlLazyRequest = useLazyRequest('payment.stripe.generateOnboardingUrl', uuid);
    const generateUpdateUrlLazyRequest = useLazyRequest('payment.stripe.generateUpdateUrl', uuid);
    const [called, setCalled] = useState(false);
    const dispatch = useDispatch();

    const onOnboardingClick = () => {
        setCalled(true);
        haptics.impact({
            style: HapticsImpactStyle.Light,
        });
        generateOnboardingUrlLazyRequest.lazyRequest(
            [
                token,
                {
                    refresh_url: `${getEnv().REACT_APP_SELF}/_/redirect/close?message=account_link_refresh`,
                    return_url: `${getEnv().REACT_APP_SELF}/_/redirect/close?message=account_link_return`,
                },
                uuid /* tick to ensure each cache is new */,
            ],
            {
                force: true,
            },
        );
    };

    const onUpdateClick = () => {
        setCalled(true);
        haptics.impact({
            style: HapticsImpactStyle.Light,
        });
        generateUpdateUrlLazyRequest.lazyRequest(
            [
                token,
                {
                    refresh_url: `${getEnv().REACT_APP_SELF}/_/redirect/close?message=account_link_refresh`,
                    return_url: `${getEnv().REACT_APP_SELF}/_/redirect/close?message=account_link_return`,
                },
                uuid /* tick to ensure each cache is new */,
            ],
            {
                force: true,
            },
        );
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
        return (
            <>
                <SectionHeader>
                    <span>{t('title')}</span>
                </SectionHeader>
                <SectionElementContainer onClick={onUpdateClick} clickable={true}>
                    <FieldsContainer>
                        <FieldContainer>
                            <FieldTitle>{t(`document_ready`)}</FieldTitle>
                            <RequirementTitle>{t('up_to_date')}</RequirementTitle>
                        </FieldContainer>
                        <FieldContainer>
                            <FieldTitle>{t('status')}</FieldTitle>
                            <StatusText color={colorFromStatus(theme, 'success')}>
                                {t(`status_ready`)}
                                <StatusIcon status={'success'} />
                            </StatusText>
                        </FieldContainer>
                    </FieldsContainer>
                    <FieldsContainer style={{ marginTop: 12, justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: 14, opacity: 0.4 }}>{t(`click_to_update`)}</span>
                    </FieldsContainer>
                </SectionElementContainer>
            </>
        );
    }

    const reason = `connect_account_${props.stripeInterface.connect_account_disabled_reason.split('.')[1]}`;
    const requirements = props.stripeInterface[reason];

    return (
        <>
            <SectionHeader>
                <span>{t('title')}</span>
            </SectionHeader>
            <SectionElementContainer onClick={onOnboardingClick} clickable={true}>
                <FieldsContainer>
                    <FieldContainer>
                        <FieldTitle>{t(`document__${reason}`)}</FieldTitle>
                        <RequirementTitle>
                            {requirements.length} {t('missing')}
                        </RequirementTitle>
                    </FieldContainer>
                    <FieldContainer>
                        <FieldTitle>{t('status')}</FieldTitle>
                        <StatusText color={colorFromStatus(theme, RequirementsStatusMapping[reason])}>
                            {t(`status__${reason}`)}
                            <StatusIcon status={RequirementsStatusMapping[reason]} />
                        </StatusText>
                    </FieldContainer>
                </FieldsContainer>
                <FieldsContainer style={{ marginTop: 12, justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: 14, opacity: 0.4 }}>{t(`click_to_fill`)}</span>
                </FieldsContainer>
            </SectionElementContainer>
        </>
    );
};
