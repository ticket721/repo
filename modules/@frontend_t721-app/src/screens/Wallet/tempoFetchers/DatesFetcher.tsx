import React  from 'react';
import { useRequest }       from '@frontend/core/lib/hooks/useRequest';
import { useSelector }    from 'react-redux';
import { T721AppState }                from '../../../redux';
import { useTranslation }         from 'react-i18next';
import { Error, FullPageLoading } from '@frontend/flib-react/lib/components';
import { Redirect }               from 'react-router';
import { DatesSearchResponseDto }      from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import TicketCard        from '../TicketCard';
import { checkFormatDate } from '@frontend/core/lib/utils/date';
import { CategoryItem } from '../interfaces';

interface DatesFetcherProps {
    uuid: string;
    entityType: 'id' | 'group_id';
    entityId: string;
    ticketId: string;
    transactionHash: string;
    category: CategoryItem;
}

export const DatesFetcher: React.FC<DatesFetcherProps> = (
    {
        uuid,
        entityType,
        entityId,
        ticketId,
        transactionHash,
        category,
    }: DatesFetcherProps) => {
    const token = useSelector((state: T721AppState) => state.auth.token.value);
    const [ t ] = useTranslation('ticket_details');
    const { response: datesResp, force: forceDatesReq } = useRequest<DatesSearchResponseDto>({
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
            refreshRate: 60,
        },
        uuid);

    if (datesResp.loading) {
        return <FullPageLoading/>;
    }

    if (datesResp.error) {
        return (<Error message={t('fetch_error')} retryLabel={t('common:retrying_in')} onRefresh={forceDatesReq}/>);
    }

    if (datesResp.data?.dates?.length > 0) {
        const currentDateIdx = datesResp.data.dates.findIndex(date => checkFormatDate(date.timestamps.event_end).getTime() > Date.now());

        return <TicketCard
            ticketId={ticketId}
            transactionHash={transactionHash}
            category={category}
            dates={datesResp.data.dates.map(date => ({
                id: date.id,
                name: date.metadata.name,
                startDate: checkFormatDate(date.timestamps.event_begin),
                endDate: checkFormatDate(date.timestamps.event_end),
                imageId: date.metadata.avatar,
                colors: date.metadata.signature_colors,
                location: date.location.location_label,
            }))}
            currentDateIdx={currentDateIdx === -1 ? 0 : currentDateIdx}/>;
    } else {
        return <Redirect to={'/'}/>;
    }
};
