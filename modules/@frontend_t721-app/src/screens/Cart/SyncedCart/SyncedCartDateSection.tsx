import React, { useState }                                                                                                     from 'react';
import {
    BorderGradient,
    CartReviewOrderEventTitle,
    completeCartRecomputingOnDateTicketChange,
    Container, ConvertedCart,
    Header,
} from './types';
import { useDispatch, useSelector }                                                                                            from 'react-redux';
import { T721AppState }                                                       from '../../../redux';
import { v4 }                                                                 from 'uuid';
import { useTranslation }                                                     from 'react-i18next';
import { useRequest }                                                         from '@frontend/core/lib/hooks/useRequest';
import { DatesSearchResponseDto }                                             from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { Border, Error, EventInfos, FullPageLoading, SingleImage, TicketQty } from '@frontend/flib-react/lib/components';
import { getImgPath }                                                         from '@frontend/core/lib/utils/images';
import { formatDay, formatHour }                                              from '@frontend/core/lib/utils/date';
import { SetTickets }                                                         from '../../../redux/ducks/cart';

export interface SyncedCartDateSectionProps {
    idx: number;
    date: string;
    convertedCart: ConvertedCart;
}

export const SyncedCartDateSection: React.FC<SyncedCartDateSectionProps> = (props: SyncedCartDateSectionProps): JSX.Element => {

    const { token } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value }));
    const [uuid] = useState(v4());
    const dispatch = useDispatch();
    const [t] = useTranslation(['cart', 'common']);

    const dateReq = useRequest<DatesSearchResponseDto>({
        method: 'dates.search',
        args: [
            token,
            {
                id: {
                    $eq: props.date,
                },
            },
        ],
        refreshRate: 10,
    }, `SyncedCartDateSection@${uuid}`);

    if (dateReq.response.loading) {
        return <FullPageLoading/>;
    }

    if (dateReq.response.error || dateReq.response.data.dates.length === 0) {
        return <Error message={t('error_cannot_fetch_dates')} retryLabel={t('common:retrying_in')} onRefresh={dateReq.force}/>;
    }

    const date = dateReq.response.data.dates[0];
    const sortedCategories = props.convertedCart.date[props.date];

    return <>
        <Header>
            <CartReviewOrderEventTitle>{t('synced_event_title')} {props.idx}</CartReviewOrderEventTitle>
            <SingleImage src={getImgPath(date.metadata.avatar)} id={1} imgOnly/>
        </Header>
        <Container>
            <EventInfos
              pullUp
              name={date.metadata.name}
              location={date.location.location_label}
              startDate={formatDay(new Date(date.timestamps.event_begin))}
              endDate={formatDay(new Date(date.timestamps.event_end))}
              startTime={formatHour(new Date(date.timestamps.event_begin))}
              endTime={formatHour(new Date(date.timestamps.event_end))}
              gradients={date.metadata.signature_colors}
              mainColor={date.metadata.signature_colors[0]}
              getDirections={t('get_directions')}
            />
            <Border/>
            {
                Object
                  .keys(sortedCategories)
                  .map((categoryId: string): JSX.Element =>
                    <TicketQty
                      options={[...new Array(5)].map((u, i) => ({label: (i + 1).toString(), value: (i + 1).toString()}))}
                      onCancel={() => {
                          dispatch(
                            SetTickets(completeCartRecomputingOnDateTicketChange(props.convertedCart, props.date, categoryId, 0))
                          )
                      }}
                      onChange={(opt) => {
                          dispatch(
                            SetTickets(completeCartRecomputingOnDateTicketChange(
                                props.convertedCart,
                                props.date,
                                categoryId,
                                parseInt(opt[0].value, 10)
                            ))
                          )
                      }}
                      initialOption={{
                          value: sortedCategories[categoryId].length.toString(),
                          label: sortedCategories[categoryId].length.toString()
                      }}
                      key={categoryId}
                      fees={`+ ${t('service_fees')}`}
                      price={`${sortedCategories[categoryId][0].price} € / ${t('each')}`}
                      ticketsLeft={sortedCategories[categoryId].length}
                      typeName={sortedCategories[categoryId][0].category.display_name}
                    />
                  )
            }
            <BorderGradient gradient={date.metadata.signature_colors}/>
        </Container>
    </>;

};
