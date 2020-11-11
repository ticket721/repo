import React from 'react';

import { useTranslation }     from 'react-i18next';
import './locales';
import styled from 'styled-components';
import { Icon } from '@frontend/flib-react/lib/components';

export const OnlineTag: React.FC = () => {
    const [ t ] = useTranslation('online_tag')

    return <Tag>
        <Icon
            icon={'live'}
            size={'12px'}
            color={'white'}/>
        <Label>{t('online_tag')}</Label>
    </Tag>
};

const Tag = styled.div`
    display: flex;
    align-items: center;
    background-color: ${props => props.theme.badgeColor.hex};
    padding: 4px 8px;
    border-radius: 12px;
`;

const Label = styled.span`
    margin-top: 2px;
    margin-left: 4px;
    color: white;
    font-size: 10px;
`;
