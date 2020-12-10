import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import './locales';

export const PreviewBanner: React.FC<{ status: 'preview' | 'live' }> = ({ status }) => {
    const [ t ] = useTranslation('preview_banner');

    if (status === 'live') {
        return <></>;
    }

    return <PreviewBannerContainer>
        {t('preview_banner_msg_1')}
        <strong>{t('preview_mode')}</strong>
        {t('preview_banner_msg_2')}
        <strong>{t('btn_name')}</strong>
        {t('preview_banner_msg_3')}
    </PreviewBannerContainer>;
};

const PreviewBannerContainer = styled.span`
    width: calc(100% - 350px);
    background-color: ${props => props.theme.primaryColorGradientEnd.hex};
    padding: ${props => props.theme.regularSpacing};
    top: 80px;
    left: 350px;
    z-index: 2;
    position: fixed;
    text-align: center;
`;