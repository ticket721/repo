import React from 'react';
import styled from 'styled-components';
import { Icon } from '@frontend/flib-react/lib/components';
import { useTranslation } from 'react-i18next';
import './locales';

export const ValidateEmail: React.FC = () => {
    const { t } = useTranslation('validate_email');
    return (
        <ValidateEmailContainer>
            <MailIcon icon={'mail'} color={'#fff'} size={'80px'} />
            <MessageFirstLine>{t('message')}</MessageFirstLine>
            <span>{t('check_your_mailbox')}</span>
        </ValidateEmailContainer>
    );
};

const ValidateEmailContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 15px;
    width: 450px;
    max-height: 100vh;
    background: linear-gradient(91.44deg, #241f33 0.31%, #1b1726 99.41%);
    padding: 60px;
    border-radius: 15px;
`;

const MessageFirstLine = styled.span`
    margin-bottom: 15px;
    text-align: center;
    line-height: 22px;
`;

const MailIcon = styled(Icon)`
    margin-bottom: 40px;
`;
