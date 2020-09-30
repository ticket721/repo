import { ConnectAccountCapability } from '@common/sdk/lib/@backend_nest/libs/common/src/stripeinterface/entities/StripeInterface.entity';
import React from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Theme } from '@frontend/flib-react/lib/config/theme';
import {
    SectionElementContainer,
    FieldsContainer,
    FieldContainer,
    FieldTitle,
    SectionHeader,
} from './StripeMenuSections';
import { StatusText, colorFromStatus, StatusIcon } from './StatusUtils';
import './SSCACapabilitiesManager.locales';

const CapabilityTitle = styled.h3`
    font-size: 16px;
    font-weight: 400;
`;

export interface SSCACapabilitiesManagerProps {
    capabilities: ConnectAccountCapability[];
}

const CapabilitiesStatusMapping = {
    inactive: 'error',
    active: 'success',
    pending: 'warning',
};

export const SSCACapabilitiesManager: React.FC<SSCACapabilitiesManagerProps> = (
    props: SSCACapabilitiesManagerProps,
): JSX.Element => {
    const [t] = useTranslation('stripe_setup_capabilities');
    const theme = useTheme() as Theme;

    const elements = props.capabilities.map((cap: ConnectAccountCapability, idx: number) => (
        <SectionElementContainer key={`${cap.name}${idx}`}>
            <FieldsContainer>
                <FieldContainer>
                    <FieldTitle>{t('name')}</FieldTitle>
                    <CapabilityTitle>{t(`name__${cap.name}`)}</CapabilityTitle>
                </FieldContainer>
                <FieldContainer>
                    <FieldTitle>{t('status')}</FieldTitle>
                    <StatusText color={colorFromStatus(theme, CapabilitiesStatusMapping[cap.status])}>
                        {t(`status__${cap.status}`)}
                        <StatusIcon status={CapabilitiesStatusMapping[cap.status]} />
                    </StatusText>
                </FieldContainer>
            </FieldsContainer>
        </SectionElementContainer>
    ));

    return (
        <>
            <SectionHeader>
                <span>{t('title')}</span>
            </SectionHeader>
            {elements}
        </>
    );
};
