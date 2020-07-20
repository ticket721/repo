import React, { useState }          from 'react';
import { useSelector }              from 'react-redux';
import { StaffAppState }            from '../../redux';
import { useTranslation }           from 'react-i18next';
import './locales';
import styled                       from 'styled-components';
import { useRequest }               from '@frontend/core/lib/hooks/useRequest';
import { TicketsCountResponseDto }  from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/tickets/dto/TicketsCountResponse.dto';
import { v4 }                       from 'uuid';
import { TicketCategoryCount }      from './TicketCategoryCount/TicketCategoryCount';

export const StatisticsFetcher: React.FC = () => {
    const [
        token,
        eventId,
        dateId,
        filteredCategories,
        checkedGuests,
    ] = useSelector((state: StaffAppState) => [
        state.auth.token.value,
        state.currentEvent.eventId,
        state.currentEvent.dateId,
        state.currentEvent.filteredCategories,
        state.currentEvent.checkedGuests,
    ]);

    const [t] = useTranslation('statistics');

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
            <StatisticsContainer>
                <TotalTicket>
                    <TotalDetails>
                        <span>{checkedGuests.length}</span>
                        <span>{totalTicketCountReq.response.data?.tickets?.count ?
                            '/' + totalTicketCountReq.response.data.tickets.count :
                            null
                        }</span>
                    </TotalDetails>
                    <TotalTitle>{t('total_title')}</TotalTitle>
                </TotalTicket>
                <CountDetails>
                    <Header>
                        <span>{t('category_label')}</span>
                        <span>{t('total_scanned_label')}</span>
                    </Header>
                    {
                        filteredCategories.map(category => (
                            <TicketCategoryCount
                                key={category.id}
                                uuid={uuid}
                                categoryName={category.name}
                                categoryId={category.id}
                            />
                        ))
                    }
                </CountDetails>
            </StatisticsContainer>
        </>
    );
};

const StatisticsContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: ${props => props.theme.biggerSpacing};
`;

const TotalTicket = styled.div`
    display: flex;
    flex-direction: column;
    text-align: center;
`;

const TotalTitle = styled.span`
    color: ${props => props.theme.textColorDark};
    margin-top: ${props => props.theme.smallSpacing};
    font-size: 12px;
    font-weight: 500;
`;

const TotalDetails = styled.div`
    font-weight: 600;
    color: ${props => props.theme.textColorDark};

    span:first-child {
        color: ${props => props.theme.textColor};
        font-size: 30px;
    }
`;

const CountDetails = styled.div`
    width: 100%;
    margin-top: ${props => props.theme.biggerSpacing};
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    padding: ${props => props.theme.regularSpacing} ${props => props.theme.biggerSpacing};
    font-size: 14px;
    font-weight: 500;
`;
