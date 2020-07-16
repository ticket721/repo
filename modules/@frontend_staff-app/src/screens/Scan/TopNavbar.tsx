import React                        from 'react';
import styled                       from 'styled-components';
import Icon                         from '@frontend/flib-react/lib/components/icon';
import { useHistory }               from 'react-router';
import { useTranslation }           from 'react-i18next';
import { DateItem, EventSelection } from '../../components/EventSelection';
import { StaffAppState }            from '../../redux';
import { useSelector } from 'react-redux';

interface TopNavbarProps {
    events: {
        id: string;
        name: string;
    }[];
    dates: DateItem[];
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ events, dates }: TopNavbarProps) => {
    const dateName = useSelector((state: StaffAppState) => state.currentEvent.dateName);
    const [ t ] = useTranslation('dropdown');
    const history = useHistory();

    return (
        <SafeOffsetContainer>
            <NavbarWrapper>
                <div onClick={() => history.push('/stats')}>
                    <Icon icon={'stats'} size={'22px'} color={'rgba(255, 255, 255, 0.9)'} />
                </div>
                <span>{dateName || t('choose_event')}</span>
                <div onClick={() => history.push('/list')}>
                    <Icon icon={'attendees'} size={'22px'} color={'rgba(255, 255, 255, 0.9)'} />
                </div>
            </NavbarWrapper>
            <EventSelection events={events} dates={dates}/>
        </SafeOffsetContainer>
    );
};

const SafeOffsetContainer = styled.div`
    display: flex;
    flex-direction: column;
    padding: ${(props) => props.theme.regularSpacing} ${(props) => props.theme.biggerSpacing} ${(props) => props.theme.smallSpacing};
    position: fixed;
    padding-top: calc(${(props) => props.theme.regularSpacing} + constant(safe-area-inset-top));
    padding-top: calc(${(props) => props.theme.regularSpacing} + env(safe-area-inset-top));
    width: 100%;
    z-index: 10;
    background-color: rgba(0, 0, 0, 0);
    backdrop-filter: blur(16px);
`;

const NavbarWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: ${props => props.theme.smallSpacing};

    & > span {
        font-size: 12px;
        font-weight: 500;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin: 0 ${props => props.theme.biggerSpacing};
        overflow: hidden;
    }
`;
