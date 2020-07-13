import React  from 'react';
import { useRequest }       from '@frontend/core/lib/hooks/useRequest';
import { useDispatch, useSelector }    from 'react-redux';
import { T721AppState }                from '../../redux';
import { useDeepEffect }               from '@frontend/core/lib/hooks/useDeepEffect';
import { PushNotification }            from '@frontend/core/lib/redux/ducks/notifications';
import { useTranslation }              from 'react-i18next';
import { FullPageLoading }             from '@frontend/flib-react/lib/components';
import { Redirect }                    from 'react-router';
import { DatesSearchResponseDto }      from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { TicketDetails }        from './TicketDetails';
import { checkFormatDate } from '@frontend/core/lib/utils/date';

interface DatesFetcherProps {
    uuid: string;
    entityType: 'id' | 'group_id';
    entityId: string;
    ticketId: string;
    transactionHash: string;
    categoryName: string;
    price: string;
    purchasedDate: Date;
}

export const DatesFetcher: React.FC<DatesFetcherProps> = (
    {
        uuid,
        entityType,
        entityId,
        ticketId,
        transactionHash,
        categoryName,
        price,
        purchasedDate,
    }: DatesFetcherProps) => {
    const dispatch = useDispatch();
    const token = useSelector((state: T721AppState) => state.auth.token.value);
    const [ t ] = useTranslation('ticket_details');
    const { response: datesResp } = useRequest<DatesSearchResponseDto>({
            method: 'dates.search',
            args: [
                token,
                {
                    [entityType]: {
                        $eq: entityId
                    },
                    $sort: [{
                        $field_name: 'timestamps.event_begin',
                        $order: 'asc',
                    }]
                }
            ],
            refreshRate: 5,
        },
        uuid);

    useDeepEffect(() => {
        if (datesResp.error) {
            dispatch(PushNotification(t('fetch_error'), 'error'));
        }
    }, [datesResp.error]);

    if (datesResp.loading) {
        return <FullPageLoading/>;
    }

    if (datesResp.data?.dates?.length > 0) {
        const filteredDates = datesResp.data.dates.filter((date) => checkFormatDate(date.timestamps.event_end).getTime() > Date.now());
        let defaultDate;

        if (filteredDates.length === 0 ) {
            defaultDate = datesResp.data.dates[0];
        } else {
            defaultDate = filteredDates[0];
        }

        return <TicketDetails
            name={defaultDate.metadata.name}
            image={defaultDate.metadata.avatar}
            colors={defaultDate.metadata.signature_colors}
            dateId={defaultDate.id}
            categoryName={categoryName}
            ticketId={ticketId}
            transactionHash={transactionHash}
            dates={datesResp.data.dates.map(date => ({
                id: date.id,
                name: date.metadata.name,
                startDate: checkFormatDate(date.timestamps.event_begin),
                endDate: checkFormatDate(date.timestamps.event_end),
                location: date.location.location_label,
            }))}
            price={price}
            purchasedDate={purchasedDate}/>;
    } else {
        return <Redirect to={'/'}/>;
    }
};
