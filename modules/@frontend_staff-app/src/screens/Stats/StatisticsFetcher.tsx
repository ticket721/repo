import React, { useState }          from 'react';
import { DateItem, EventSelection } from '../../components/EventSelection';
import { useSelector }              from 'react-redux';
import { StaffAppState }            from '../../redux';
import { useTranslation }           from 'react-i18next';
import styled                       from 'styled-components';
import { Icon }                     from '@frontend/flib-react/lib/components';
import { CategoriesFetcher }        from '../../components/Filters/CategoriesFetcher';
import { useRequest }               from '@frontend/core/lib/hooks/useRequest';
import { TicketsCountResponseDto }  from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/tickets/dto/TicketsCountResponse.dto';
import { v4 }                       from 'uuid';
import { TicketCategoryCount }      from './TicketCategoryCount/TicketCategoryCount';

interface StatisticsProps {
    events: {
        id: string;
        name: string;
    }[];
    dates: DateItem[];
}

export const StatisticsFetcher: React.FC<StatisticsProps> = ({ events, dates }: StatisticsProps) => {
    const [
        token,
        eventId,
        dateId,
        dateName,
        filteredCategories,
        checkedGuests,
    ] = useSelector((state: StaffAppState) => [
        state.auth.token.value,
        state.currentEvent.eventId,
        state.currentEvent.dateId,
        state.currentEvent.dateName,
        state.currentEvent.filteredCategories,
        state.currentEvent.checkedGuests,
    ]);

    const [t] = useTranslation('statistics');

    const [ filterOpened, setFilterOpened ] = useState<boolean>(false);
    const [uuid] = useState(v4() + '@statistics');

    const totalTicketCountReq = useRequest<TicketsCountResponseDto>({
        method: 'tickets.count',
        args: [
            token,
            {
                parent_id: {
                    $in: [eventId, dateId],
                },
            }
        ],
        refreshRate: 20
    }, uuid);

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
            <StatisticsContainer>
                <TotalTicket>
                    <TotalTitle>{t('total_title')}</TotalTitle>
                    <TotalDetails>
                        <span>{checkedGuests.length}</span>
                        <span>{totalTicketCountReq.response.data?.tickets?.count ?
                            '/' + totalTicketCountReq.response.data.tickets.count :
                            null
                        }</span>
                    </TotalDetails>
                </TotalTicket>
                <CountDetails>
                    <Header>
                        <span>{t('category_label')}</span>
                        <span>{t('remaining_label')}</span>
                        <span>{t('total_label')}</span>
                    </Header>
                    {
                        filteredCategories.map(category => (
                            <TicketCategoryCount
                                uuid={uuid}
                                categoryName={category.name}
                                categoryId={category.id}
                            />
                        ))
                    }
                </CountDetails>
            </StatisticsContainer>
            <CategoriesFetcher open={filterOpened} onClose={() => setFilterOpened(false)}/>
        </>
    );
};

const FiltersContainer = styled.div`
    display: flex;
    align-items: center;
`;

const DropdownContainer = styled.div`
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

const StatisticsContainer = styled.div`
`;

const TotalTicket = styled.div`

`;

const TotalTitle = styled.span`
`;

const TotalDetails = styled.div`
`;

const CountDetails = styled.div`

`;

const Header = styled.div`

`;
