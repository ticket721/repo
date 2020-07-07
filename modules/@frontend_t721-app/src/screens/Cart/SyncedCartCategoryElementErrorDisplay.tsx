import { CategoryEntity }                                                           from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import React, { useState }                                                          from 'react';
import { useSelector }                                                              from 'react-redux';
import { T721AppState }                                                             from '../../redux';
import { v4 }                                                                       from 'uuid';
import { useRequest }                                                               from '@frontend/core/lib/hooks/useRequest';
import { DatesSearchResponseDto }                                                   from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { CategoryInErrorState, Error, FullPageLoading, GlobalCategoryInErrorState } from '@frontend/flib-react/lib/components';
import { getImgPath }                                                               from '@frontend/core/lib/utils/images';
import { getT721TokenPrice }                                                        from '../../utils/prices';
import { formatShort }                                                              from '@frontend/core/lib/utils/date';
import { DateEntity }                                                               from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';

interface SyncedCartCategoryRegularCategoryErrorDisplayProps {
    category: CategoryEntity;
    amount: number;
}

const SyncedCartCategoryRegularCategoryErrorDisplay: React.FC<SyncedCartCategoryRegularCategoryErrorDisplayProps> =
    (props: SyncedCartCategoryRegularCategoryErrorDisplayProps): JSX.Element => {
        const { token } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value }));
        const [uuid] = useState(v4());

        const dateReq = useRequest<DatesSearchResponseDto>({
            method: 'dates.search',
            args: [
                token,
                {
                    id: {
                        $eq: props.category.parent_id
                    }
                }
            ],
            refreshRate: 5
        }, `SyncedCartCategoryRegularCategoryErrorDisplay@${uuid}`);

        if (dateReq.response.loading) {
            return <FullPageLoading/>;
        }

        if (dateReq.response.error || dateReq.response.data.dates.length === 0) {
            return <Error message={'Cannot fetch event'}/>;
        }

        const dateEntity = dateReq.response.data.dates[0];
        const imgPath = getImgPath(dateEntity.metadata.avatar);

        return <CategoryInErrorState
            categoryName={props.category.display_name}
            image={imgPath}
            price={`${getT721TokenPrice(props.category.prices)} €`}
            amount={props.amount}
            date={formatShort(new Date(dateEntity.timestamps.event_begin))}
        />;

    };

interface SyncedCartCategoryGlobalCategoryErrorDisplayProps {
    category: CategoryEntity;
    amount: number;
}

const SyncedCartCategoryGlobalCategoryErrorDisplay: React.FC<SyncedCartCategoryGlobalCategoryErrorDisplayProps> =
    (props: SyncedCartCategoryRegularCategoryErrorDisplayProps): JSX.Element => {
        const { token } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value }));
        const [uuid] = useState(v4());

        const datesRequest = useRequest<DatesSearchResponseDto>({
            method: 'dates.search',
            args: [
                token,
                {
                    group_id: {
                        $eq: props.category.group_id,
                    },
                    parent_type: {
                        $eq: 'event'
                    }
                },
            ],
            refreshRate: 100,
        }, `SyncedCartGlobalTicketCountDisplay@${uuid}`);

        if (datesRequest.response.loading) {
            return <FullPageLoading/>;
        }

        if (datesRequest.response.error || datesRequest.response.data.dates.length === 0) {
            return <Error message={'Cannot fetch date'}/>;
        }

        const dateEntities = datesRequest.response.data.dates;

        return <GlobalCategoryInErrorState
            categoryName={props.category.display_name}
            dates={dateEntities.map((d: DateEntity) => ({
                gradient: d.metadata.signature_colors,
                avatar: getImgPath(d.metadata.avatar),
                eventBegin: formatShort(new Date(d.timestamps.event_begin)),
            }))}
            price={`${getT721TokenPrice(props.category.prices)} €`}
            amount={props.amount}
            starred={true}
        />;

    };

interface SyncedCartCategoryElementErrorDisplayProps {
    category: CategoryEntity;
    amount: number;
}

export const SyncedCartCategoryElementErrorDisplay: React.FC<SyncedCartCategoryElementErrorDisplayProps> =
    (props: SyncedCartCategoryElementErrorDisplayProps): JSX.Element => {

        if (props.category.parent_type === 'event') {
            return <SyncedCartCategoryGlobalCategoryErrorDisplay category={props.category} amount={props.amount}/>;
        } else {
            return <SyncedCartCategoryRegularCategoryErrorDisplay category={props.category} amount={props.amount}/>;
        }

    };
