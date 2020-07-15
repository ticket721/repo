import React     from 'react';
import styled         from 'styled-components';
import Icon           from '@frontend/flib-react/lib/components/icon';
import { useHistory } from 'react-router';
import { useTranslation } from 'react-i18next';
import './locales';

const SafeOffsetContainer = styled.div`
    align-items: center;
    display: flex;
    font-size: 14px;
    font-weight: 500;
    justify-content: space-between;
    padding: ${(props) => props.theme.regularSpacing} ${(props) => props.theme.biggerSpacing};
    position: fixed;
    height: calc(48px + constant(safe-area-inset-top));
    height: calc(48px + env(safe-area-inset-top));
    padding-top: calc(${(props) => props.theme.regularSpacing} + constant(safe-area-inset-top));
    padding-top: calc(${(props) => props.theme.regularSpacing} + env(safe-area-inset-top));
    width: 100%;
    z-index: 9999;
    background-color: rgba(0, 0, 0, 0);
    backdrop-filter: blur(16px);
`;

export const TopNav: React.FC = () => {
    const [ t ] = useTranslation('scanner');
    const history = useHistory();

    return (
        <SafeOffsetContainer>
            <div onClick={() => history.push('/stats')}>
                <Icon icon={'stats'} size={'16px'} color={'rgba(255, 255, 255, 0.9)'} />
            </div>
            <span>{t('scanner_label')}</span>
            <div onClick={() => history.push('/list')}>
                <Icon icon={'attendees'} size={'16px'} color={'rgba(255, 255, 255, 0.9)'} />
            </div>
        </SafeOffsetContainer>
    );
};
