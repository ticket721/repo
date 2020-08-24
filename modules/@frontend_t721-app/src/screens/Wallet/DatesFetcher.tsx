import React                                      from 'react';
import { useRequest }                             from '@frontend/core/lib/hooks/useRequest';
import { useSelector }                            from 'react-redux';
import { T721AppState }                           from '../../redux';
import { useTranslation }                         from 'react-i18next';
import { FullPageLoading }                        from '@frontend/flib-react/lib/components';
import { DatesSearchResponseDto }                 from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { checkFormatDate, formatDay, formatHour } from '@frontend/core/lib/utils/date';
import { Error }                                  from '@frontend/flib-react/lib/components';
import { getImgPath }                             from '@frontend/core/lib/utils/images';
import { Ticket }                                 from '../../types/ticket';
import { DateEntity }                             from '@backend/nest/libs/common/src/dates/entities/Date.entity';
// import { Tickets }                                from './Tickets';

const formatDates = (tickets: Ticket[], dates: DateEntity[], globalDates: DateEntity[]): Ticket[] =>
    tickets.map(ticket => {
        let ticketDate;
        let startDate;
        let endDate;

        if (ticket.ticketType === 'date') {
            ticketDate = dates.find(date => date.id === ticket.entityId);
            startDate = checkFormatDate(ticketDate.timestamps.event_begin);
            endDate = checkFormatDate(ticketDate.timestamps.event_end);
        } else {
            const groupedDates = globalDates.filter(date => date.group_id === ticket.entityId);
            const filteredDates = groupedDates.filter(date => checkFormatDate(date.timestamps.event_end).getTime() > Date.now());

            if (filteredDates.length === 0) {
                ticketDate =  groupedDates[0];
            } else {
                ticketDate = filteredDates[0];
            }

            startDate = checkFormatDate(ticketDate.timestamps.event_begin);
            endDate = checkFormatDate(groupedDates[groupedDates.length - 1].timestamps.event_end);
        }

        return {
            ...ticket,
            name: ticketDate.metadata.name,
            location: ticketDate.location.location_label,
            startDate: formatDay(startDate),
            startTime: formatHour(startDate),
            endDate: formatDay(endDate),
            endTime: formatHour(endDate),
            gradients: ticketDate.metadata.signature_colors,
            mainColor: ticketDate.metadata.signature_colors[0],
            image: getImgPath(ticketDate.metadata.avatar),
        }
    });

interface DatesFetcherProps {
    uuid: string;
    tickets: Ticket[],
}

export const DatesFetcher: React.FC<DatesFetcherProps> = (
    {
        uuid,
        tickets,
    }: DatesFetcherProps) => {
    const token = useSelector((state: T721AppState) => state.auth.token.value);
    const [ t ] = useTranslation(['wallet', 'common']);
    const { response: datesResp, force: forceDatesReq } = useRequest<DatesSearchResponseDto>({
            method: 'dates.search',
            args: [
                token,
                {
                    id: {
                        $in: tickets.filter(ticket => ticket.ticketType === 'date').map(ticket => ticket.entityId),
                    },
                    $sort: [{
                        $field_name: 'timestamps.event_begin',
                        $order: 'asc',
                    }]
                }
            ],
            refreshRate: 60,
        },
        uuid);

    const { response: globalDatesResp, force: forceGlobalDatesReq } = useRequest<DatesSearchResponseDto>({
            method: 'dates.search',
            args: [
                token,
                {
                    group_id: {
                        $in: tickets.filter(ticket => ticket.ticketType === 'global').map(ticket => ticket.entityId),
                    },
                    $sort: [{
                        $field_name: 'timestamps.event_begin',
                        $order: 'asc',
                    }]
                }
            ],
            refreshRate: 60,
        },
        uuid);

    if (datesResp.loading || globalDatesResp.loading) {
        return <FullPageLoading/>;
    }

    if (datesResp.error) {
        return (<Error message={t('fetch_error')} retryLabel={t('common:retrying_in')} onRefresh={forceDatesReq}/>);
    }

    if (globalDatesResp.error) {
        return (<Error message={t('fetch_error')} retryLabel={t('common:retrying_in')} onRefresh={forceGlobalDatesReq}/>);
    }

    // if (datesResp.data?.dates?.length > 0 || globalDatesResp.data?.dates?.length > 0) {
    //     return <Tickets
    //         tickets={formatDates(tickets, datesResp.data.dates, globalDatesResp.data.dates)}/>
    // }
};
