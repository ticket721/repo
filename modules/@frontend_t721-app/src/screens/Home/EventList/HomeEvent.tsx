import React, { useState }                    from 'react';
import { formatDay, formatHour, formatShort } from '@frontend/core/lib/utils/date';
import { v4 }                                 from 'uuid';
import { useRequest }                     from '@frontend/core/lib/hooks/useRequest';
import {
    CategoriesSearchResponseDto
}    from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { SingleImage }                    from '@frontend/flib-react/lib/components';
import { DateEntity }                     from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { useHistory }                     from 'react-router';
import { getImgPath }                     from '@frontend/core/lib/utils/images';
import { useTranslation }                 from 'react-i18next';
import { useToken }                       from '@frontend/core/lib/hooks/useToken';
import styled                             from 'styled-components';
import {motion}                           from 'framer-motion';
import { useHaptics, HapticsImpactStyle } from '@frontend/core/lib/hooks/useHaptics';
import { getPriceRange }                  from '@frontend/core/lib/utils/prices';

export interface HomeEventProps {
    date: DateEntity;
    idx: number;
}

const sameDay = (d1: Date, d2: Date): boolean => {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}


const getDateString = (begin: Date, end: Date, t: any): string => {
    if (sameDay(begin, end)) {
        return `${formatDay(begin)}, ${formatHour(begin)} ${t('hour_to')} ${formatHour(end)}`;
    }
    return `${formatShort(begin)} ${t('day_to')} ${formatShort(end)}`;
}

export const HomeEvent: React.FC<HomeEventProps> = (props: HomeEventProps): JSX.Element => {

    const imageUrl = getImgPath(props.date.metadata.avatar);
    const [uuid] = useState(v4());
    const token = useToken();
    const history = useHistory();
    const [t] = useTranslation(['home', 'common']);
    const haptics = useHaptics();

    const dateString = getDateString(new Date(props.date.timestamps.event_begin), new Date(props.date.timestamps.event_end), t);

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


    return <EventContainer
        whileTap={{
            scale: 0.98
        }}
        onTap={() => {
            haptics.impact({
                style: HapticsImpactStyle.Light
            })
            history.push(`/event/${props.date.id}`)
        }}
    >
        <SingleImage
            id={props.idx}
            key={props.idx}
            cover={imageUrl}
            text={props.date.location ? props.date.location.location_label : t('online')}
            online={props.date.online}
            online_text={t('online')}
            title={props.date.metadata.name}
            mainColor={props.date.metadata.signature_colors[0]}
            price={priceString}
            dateLabel={dateString}/>
    </EventContainer>
};

const EventContainer = styled(motion.div)`
    margin: ${props => props.theme.regularSpacing};
    cursor: pointer;

    width: calc((100% - 8 * ${props => props.theme.regularSpacing}) / 4);

    @media screen and (max-width: 1450px) {
        width: calc((100% - 6 * ${props => props.theme.regularSpacing}) / 3);
    }

    @media screen and (max-width: 1100px) {
        width: calc((100% - 4 * ${props => props.theme.regularSpacing}) / 2);
    }

    @media screen and (max-width: 750px) {
        width: calc(100% - 2 * ${props => props.theme.regularSpacing});
    }
`;
