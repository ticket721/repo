import React, { useState }             from 'react';
import { formatShort }                 from '@frontend/core/lib/utils/date';
import { v4 }                          from 'uuid';
import { useSelector }                 from 'react-redux';
import { AppState }                    from '@frontend/core/lib/redux';
import { useRequest }                  from '@frontend/core/lib/hooks/useRequest';
import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { SingleImage }                 from '@frontend/flib-react/lib/components';
import { DateEntity }                  from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { getPriceRange }               from '../../../utils/prices';

export interface HomeEventProps {
    date: DateEntity;
    idx: number;
}

export const HomeEvent: React.FC<HomeEventProps> = (props: HomeEventProps): JSX.Element => {

    const serverUrl = `${process.env.REACT_APP_T721_SERVER_PROTOCOL}://${process.env.REACT_APP_T721_SERVER_HOST}:${process.env.REACT_APP_T721_SERVER_PORT}/static`;
    const imageUrl = `${serverUrl}/${props.date.metadata.avatar}`;
    const eventBegin = formatShort(new Date(props.date.timestamps.event_begin));
    const eventEnd = formatShort(new Date(props.date.timestamps.event_end));
    const [uuid] = useState(v4());
    const token = useSelector((state: AppState): string => state.auth.token?.value);

    const dateString = `${eventBegin ? eventBegin : null}${eventEnd && eventBegin ? ' - ' : null}${eventEnd ? eventEnd : null}`;

    const categories = useRequest<CategoriesSearchResponseDto>({
        method: 'categories.search',
        args: [token, {
            id: {
                $in: props.date.categories
            }
        }],
        refreshRate: 100
    }, `HomeEvent@${uuid}`);

    const globalCategories = useRequest<CategoriesSearchResponseDto>({
        method: 'categories.search',
        args: [
            token,
            {
                group_id: {
                    $eq: props.date.group_id
                },
                parent_type: {
                    $eq: 'event'
                },
            }
        ],
        refreshRate: 100
    }, `HomeEvent@${uuid}`);

    const priceRange = getPriceRange([
        ...(categories.response.data?.categories || []),
        ...(globalCategories.response.data?.categories || [])
    ]);

    let priceString;

    if (priceRange[0] && priceRange[1]) {
        priceString = `${priceRange[0] || 'FREE'} - ${priceRange[1]}`
    } else if (priceRange[0]) {
        priceString = `${priceRange[0]}`
    }

    return <SingleImage
        id={props.idx}
        key={props.idx}
        src={imageUrl}
        text={props.date.location.location_label}
        title={props.date.metadata.name}
        mainColor={props.date.metadata.signature_colors[0]}
        price={priceString}
        dateLabel={dateString}
    />
};
