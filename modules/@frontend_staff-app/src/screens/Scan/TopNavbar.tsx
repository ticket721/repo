import React                        from 'react';
import styled                       from 'styled-components';
import Icon                         from '@frontend/flib-react/lib/components/icon';
import { useHistory }               from 'react-router';
import { useTranslation }           from 'react-i18next';
import { DateItem, EventSelection } from '../../components/EventSelection';
import { StaffAppState }            from '../../redux';
import { useSelector }              from 'react-redux';
import { Status }                   from './Scanner';

interface TopNavbarProps {
    events: {
        id: string;
        name: string;
    }[];
    dates: DateItem[];
    status: Status;
    msg?: string;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ events, dates, status, msg }: TopNavbarProps) => {
    const dateName = useSelector((state: StaffAppState) => state.currentEvent.dateName);
    const [ t ] = useTranslation('dropdown');
    const history = useHistory();

    return (
        <SafeOffsetContainer status={status}>
            <EventSelection hideCalendar={true} events={events} dates={dates}/>
            <NavbarWrapper>
                <div onClick={() => history.push('/stats')}>
                    <Icon icon={'stats'} size={'22px'} color={'rgba(255, 255, 255, 0.9)'} />
                </div>
                <Title status={status}>{msg || dateName || t('choose_event')}</Title>
                <div onClick={() => history.push('/list')}>
                    <Icon icon={'attendees'} size={'22px'} color={'rgba(255, 255, 255, 0.9)'} />
                </div>
            </NavbarWrapper>
        </SafeOffsetContainer>
    );
};

const SafeOffsetContainer = styled.div<{ status: Status }>`
    display: flex;
    flex-direction: column;
    padding: ${(props) => props.theme.regularSpacing} ${(props) => props.theme.biggerSpacing} ${(props) => props.theme.smallSpacing};
    position: fixed;
    padding-top: calc(${(props) => props.theme.smallSpacing} + constant(safe-area-inset-top));
    padding-top: calc(${(props) => props.theme.smallSpacing} + env(safe-area-inset-top));
    width: 100%;
    z-index: 10;
    background-color: ${
    props => props.status === 'error' ? `rgba(${props.theme.errorColor.r}, ${props.theme.errorColor.g}, ${props.theme.errorColor.b}, 0.1)` :
        props.status === 'success' ? `rgba(${props.theme.successColor.r}, ${props.theme.successColor.g}, ${props.theme.successColor.b}, 0.1)` :
        'rgba(0, 0, 0, 0)'
    };
    backdrop-filter: blur(16px);
`;

const NavbarWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    font-weight: 500;
    margin-top: ${props => props.theme.smallSpacing};
`;

const Title = styled.span<{ status: string }>`
    font-size: 12px;
    line-height: 14px;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin: 0 ${props => props.theme.biggerSpacing};
    overflow: hidden;
    color: ${props => props.status === 'error' ?
        props.theme.errorColor.hex :
            props.status === 'success' ?
        props.theme.successColor.hex :
        props.theme.textColor};
`;
