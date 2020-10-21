import React from 'react';

import { useTranslation }     from 'react-i18next';
import './locales';
import styled from 'styled-components';
import { Icon } from '@frontend/flib-react/lib/components';

export const MultiDatesTag: React.FC = () => {
    const [ t ] = useTranslation('multi_dates_tag')

    return <Tag>
        <Icon
            icon={'multi-dates'}
            size={'12px'}
            color={'white'}/>
        <Label>{t('multi_dates_tag')}</Label>
    </Tag>
};

const Tag = styled.div`
    display: flex;
    align-items: center;
    background-color: ${props => props.theme.primaryColorGradientEnd.hex};
    padding: 4px 8px;
    border-radius: 12px;
`;

const Label = styled.span`
    margin-top: 2px;
    margin-left: 4px;
    color: white;
    font-size: 10px;
`;
