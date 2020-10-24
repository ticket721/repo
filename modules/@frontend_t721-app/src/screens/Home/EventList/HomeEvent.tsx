import React, { useState }             from 'react';
import { formatShort }                 from '@frontend/core/lib/utils/date';
import { v4 }                          from 'uuid';
import { useSelector }                 from 'react-redux';
import { AppState }                    from '@frontend/core/lib/redux';
import { useRequest }                  from '@frontend/core/lib/hooks/useRequest';
import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { SingleImage }                 from '@frontend/flib-react/lib/components';
import { DateEntity }                  from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { useHistory }                  from 'react-router';
import { getImgPath }                  from '@frontend/core/lib/utils/images';
import { getPriceRange }               from '../../../utils/prices';
import { useTranslation }              from 'react-i18next';

export interface HomeEventProps {
    date: DateEntity;
    idx: number;
}

export const HomeEvent: React.FC<HomeEventProps> = (props: HomeEventProps): JSX.Element => {

    const imageUrl = getImgPath(props.date.metadata.avatar);
    const eventBegin = formatShort(new Date(props.date.timestamps.event_begin));
    const eventEnd = formatShort(new Date(props.date.timestamps.event_end));
    const [uuid] = useState(v4());
    const token = useSelector((state: AppState): string => state.auth.token?.value);
    const history = useHistory();
    const [t] = useTranslation(['home', 'common']);

    const dateString = `${eventBegin ? eventBegin : null}${eventEnd && eventBegin ? ' - ' : null}${eventEnd ? eventEnd : null}`;

    const categories = useRequest<CategoriesSearchResponseDto>({
        method: 'categories.search',
        args: [token, {
            id: {
                $in: props.date.categories
            },
            status: {
                $eq: 'live'
            }
        }],
        refreshRate: 100
    }, `HomeEvent@${uuid}`);


    const priceString = getPriceRange([
        ...(categories.response.data?.categories || []),
    ], t('coming_soon'));


    return <SingleImage
        onClick={() => history.push(`/event/${props.date.id}`)}
        id={props.idx}
        key={props.idx}
        src={imageUrl}
        text={props.date.location ? props.date.location.location_label : t('online')}
        online={props.date.online}
        online_text={t('online')}
        title={props.date.metadata.name}
        mainColor={props.date.metadata.signature_colors[0]}
        price={priceString}
        dateLabel={dateString}
    />
};
