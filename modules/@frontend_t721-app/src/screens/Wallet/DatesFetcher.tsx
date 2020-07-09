import React                                           from 'react';
import { useRequest }                                  from '@frontend/core/lib/hooks/useRequest';
import { useSelector }                                 from 'react-redux';
import { T721AppState }                                from '../../redux';
import { useTranslation }                              from 'react-i18next';
import { FullPageLoading }                             from '@frontend/flib-react/lib/components';
import { DatesSearchResponseDto }                      from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { checkFormatDate, formatDay, formatHour } from '@frontend/core/lib/utils/date';
import TicketCard                                      from './TicketCard';
import { Error }                                       from '@frontend/flib-react/lib/components';
import { getImgPath }                                  from '@frontend/core/lib/utils/images';

interface DatesFetcherProps {
    uuid: string;
    entityType: 'id' | 'groupId';
    entityId: string;
    ticketId: string;
    categoryName: string;
}

export const DatesFetcher: React.FC<DatesFetcherProps> = (
    {
        uuid,
        entityType,
        entityId,
        ticketId,
        categoryName,
    }: DatesFetcherProps) => {
    const token = useSelector((state: T721AppState) => state.auth.token.value);
    const [ t ] = useTranslation('wallet');
    const { response: datesResp } = useRequest<DatesSearchResponseDto>({
            method: 'dates.search',
            args: [
                token,
                {
                    [entityType]: {
                        $eq: entityId
                    },
                    $sort: {
                        $field_name: 'timestamps.event_begin',
                        $order: 'asc',
                    }
                }
            ],
            refreshRate: 5,
        },
        uuid);

    if (datesResp.error || datesResp.data?.dates?.length === 0) {
        return (<Error message={t('fetch_error')}/>);
    }

    if (datesResp.loading) {
        return <FullPageLoading/>;
    }

    if (datesResp.data?.dates?.length > 0) {
        const filteredDates = datesResp.data.dates.filter((date) => checkFormatDate(date.timestamps.event_end).getTime() > Date.now());
        let defaultDate;

        if (filteredDates.length === 0) {
            defaultDate =  datesResp.data.dates[0];
        } else {
            defaultDate = filteredDates[0];
        }

        const startDate = defaultDate.timestamps.event_begin;
        const endDate = datesResp.data.dates[datesResp.data.dates.length - 1].timestamps.event_end;

        return <TicketCard
            ticket={{
                name: defaultDate.metadata.name,
                ticketId,
                location: defaultDate.location.location_label,
                ticketType: categoryName,
                startDate: formatDay(checkFormatDate(startDate)),
                endDate: formatDay(checkFormatDate(endDate)),
                startTime: formatHour(checkFormatDate(startDate)),
                endTime: formatHour(checkFormatDate(endDate)),
                gradients: defaultDate.metadata.signature_colors,
                mainColor: defaultDate.metadata.signature_colors[0],
                image: getImgPath(defaultDate.metadata.avatar),
            }}/>
    }
};
