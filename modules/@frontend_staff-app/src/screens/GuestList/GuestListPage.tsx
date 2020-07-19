import React                        from 'react';
import { DateItem, EventSelection } from '../../components/EventSelection';
import { useSelector }              from 'react-redux';
import { StaffAppState }            from '../../redux';
import { useTranslation }           from 'react-i18next';
import styled                       from 'styled-components';
import { GuestListFetcher }         from './Attendees/GuestListFetcher';

interface GuestListPageProps {
    events: {
        id: string;
        name: string;
    }[];
    dates: DateItem[];
}

export const GuestListPage: React.FC<GuestListPageProps> = ({ events, dates }: GuestListPageProps) => {
    const [
        dateId,
        dateName
    ] = useSelector((state: StaffAppState) =>
        [
            state.currentEvent.dateId,
            state.currentEvent.dateName
        ]);
    const [ t ] = useTranslation('dropdown');
    return (
        <>
            <DropdownContainer>
                <span>{dateName || t('choose_event')}</span>
                <EventSelection events={events} dates={dates}/>
            </DropdownContainer>
            {
                dateId ?
                    <GuestListFetcher/> :
                    null
            }
        </>
    );
};

const DropdownContainer = styled.div`
    padding: ${props => props.theme.regularSpacing};

    & > span {
        display: block;
        margin-bottom: ${props => props.theme.smallSpacing};
        font-size: 13px;
        font-weight: 500;
        color: ${props => props.theme.textColorDark};
    }
`;

const GuestListingContainer = styled.div`
`;
