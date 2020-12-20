import { DateEntity }                  from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import React, { useState }             from 'react';
import { v4 }                          from 'uuid';
import { useRequest }                  from '@frontend/core/lib/hooks/useRequest';
import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { SingleEvent }                 from '@frontend/flib-react/lib/components';
import { formatShort }                 from '@frontend/core/lib/utils/date';
import { useHistory }                  from 'react-router';
import { getImgPath }                  from '@frontend/core/lib/utils/images';
import { useTranslation }              from 'react-i18next';
import { useToken }                    from '@frontend/core/lib/hooks/useToken';
import { getPriceRange }               from '@frontend/core/lib/utils/prices';

interface SearchViewAllResultEventProps {
    date: DateEntity;
    idx: number;
}

export const SearchViewAllResultEvent: React.FC<SearchViewAllResultEventProps> = (props: SearchViewAllResultEventProps): JSX.Element => {

    const imageUrl = getImgPath(props.date.metadata.avatar);
    const [uuid] = useState(v4());
    const token = useToken();
    const history = useHistory();
    const [t] = useTranslation(['search_view_all', 'common']);

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
    ], t('coming_soon'), t('free'));

    return <SingleEvent
        onClick={() => history.push(`/event/${props.date.id}`)}
        name={props.date.metadata.name}
        color={props.date.metadata.signature_colors[0]}
        id={props.idx}
        price={priceString}
        online={props.date.online}
        date={formatShort(new Date(props.date.timestamps.event_begin))}
        image={imageUrl}
    />;

};

