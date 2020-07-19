import React, { useState }          from 'react';
import { DateItem, EventSelection } from '../../components/EventSelection';
import { useSelector }              from 'react-redux';
import { StaffAppState }            from '../../redux';
import { useTranslation }           from 'react-i18next';
import styled                       from 'styled-components';
import { GuestListFetcher }         from './Attendees/GuestListFetcher';
import { CategoriesFetcher }        from '../../components/Filters/CategoriesFetcher';
import { Icon  }                        from '@frontend/flib-react/lib/components';

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

    const [ filterOpened, setFilterOpened ] = useState<boolean>(false);

    return (
        <>
            <FiltersContainer>
                <DropdownContainer>
                    <span>{dateName || t('choose_event')}</span>
                    <EventSelection events={events} dates={dates}/>
                </DropdownContainer>
                <div onClick={() => setFilterOpened(true)}>
                    <Icon icon={'filter'} size={'12px'} color={'#FFF'}/>
                </div>
            </FiltersContainer>
            {
                dateId ?
                    <GuestListFetcher/> :
                    null
            }
            <CategoriesFetcher open={filterOpened} onClose={() => setFilterOpened(false)}/>
        </>
    );
};

const FiltersContainer = styled.div`
    display: flex;
    align-items: center;
`;

const DropdownContainer = styled.div`
    width: calc(100% - 40px);
    padding: ${props => props.theme.regularSpacing};

    & > span {
        display: block;
        margin-bottom: ${props => props.theme.smallSpacing};
        font-size: 13px;
        font-weight: 500;
        color: ${props => props.theme.textColorDark};
    }

    [class$=indicatorContainer] {
        display: none;
    }
`;
