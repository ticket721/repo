import { CategoryEntity }                   from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { TicketMintingFormat }              from '@common/sdk/lib/@backend_nest/libs/common/src/utils/Cart.type';
import { RequestBag }                       from '@frontend/core/lib/hooks/useRequest';
import { DatesSearchResponseDto }           from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import React                                from 'react';
import { useTranslation }                   from 'react-i18next';
import { Error, SingleStarEvent, Skeleton } from '@frontend/flib-react/lib/components';
import { DateEntity, DateMetadata }         from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { getImgPath }                       from '@frontend/core/lib/utils/images';
import { getT721TokenPrice }                from '../../../utils/prices';

export interface SyncedCartEventCategoryProps {
    category: CategoryEntity;
    tickets: TicketMintingFormat[]
    dates: RequestBag<DatesSearchResponseDto>;
}

export const SyncedCartEventCategory: React.FC<SyncedCartEventCategoryProps> = (props: SyncedCartEventCategoryProps): JSX.Element => {

    const [t] = useTranslation('cart');

    if (props.dates.response.loading) {
        return <Skeleton ready={false} showLoadingAnimation={true} type={'text'} rows={2}>
            <></>
        </Skeleton>;
    }

    if (props.dates.response.error) {
        return <Error message={'Cannot load date'}/>;
    }

    const metadatas = props.dates.response.data.dates
        .map((date: DateEntity): DateMetadata => date.metadata);

    const imageUrl = getImgPath(metadatas[0].avatar);

    return <SingleStarEvent
        customMarginBottom={'0px'}
        id={props.category.id}
        name={`${props.tickets.length} ${props.category.display_name}`}
        color={metadatas[0].signature_colors[0]}
        price={getT721TokenPrice(props.category.prices)}
        date={t('select_group_id_dates', {count: props.dates.response.data.dates.length})}
        image={imageUrl}
    />;

};

