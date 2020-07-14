import { CategoryEntity }               from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { TicketMintingFormat }          from '@common/sdk/lib/@backend_nest/libs/common/src/utils/Cart.type';
import { RequestBag }                   from '@frontend/core/lib/hooks/useRequest';
import { DatesSearchResponseDto }       from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import React                            from 'react';
import { Error, SingleEvent, Skeleton } from '@frontend/flib-react/lib/components';
import { DateEntity }                   from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { uuidEq }                       from '@common/global';
import { getT721TokenPrice }            from '../../../utils/prices';
import { formatShort }                  from '@frontend/core/lib/utils/date';
import { useTranslation }               from 'react-i18next';

export interface SyncedCartDateCategoryProps {
    category: CategoryEntity;
    tickets: TicketMintingFormat[]
    dates: RequestBag<DatesSearchResponseDto>;
}

export const SyncedCartDateCategory: React.FC<SyncedCartDateCategoryProps> = (props: SyncedCartDateCategoryProps): JSX.Element => {

    const [t] = useTranslation(['cart', 'common']);

    if (props.dates.response.loading) {
        return <Skeleton ready={false} showLoadingAnimation={true} type={'text'} rows={2}>
            <></>
        </Skeleton>;
    }

    if (props.dates.response.error ||
        props.dates.response.data.dates.findIndex((date: DateEntity): boolean => uuidEq(props.category.parent_id, date.id)) === -1) {
        return <Error message={t('cannot_fetch_date')} retryLabel={t('common:retrying_in')} onRefresh={props.dates.force}/>;
    }

    const dateIdx = props.dates.response.data.dates.findIndex((date: DateEntity): boolean => uuidEq(props.category.parent_id, date.id));
    const dateEntity: DateEntity = props.dates.response.data.dates[dateIdx];
    const serverUrl = `${process.env.REACT_APP_T721_SERVER_PROTOCOL}://${process.env.REACT_APP_T721_SERVER_HOST}:${process.env.REACT_APP_T721_SERVER_PORT}/static`;
    const imageUrl = `${serverUrl}/${dateEntity.metadata.avatar}`;

    return <SingleEvent
        customMarginBottom={'0px'}
        id={dateEntity.id}
        name={`${props.tickets.length} ${props.category.display_name}`}
        color={dateEntity.metadata.signature_colors[0]}
        price={getT721TokenPrice(props.category.prices)}
        date={formatShort(new Date(dateEntity.timestamps.event_begin))}
        image={imageUrl}
    />;

};

