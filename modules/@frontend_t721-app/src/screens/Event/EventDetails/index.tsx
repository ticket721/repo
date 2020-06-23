import React, { useState } from 'react';
import {
    Error,
    FullPageLoading,
}                                      from '@frontend/flib-react/lib/components';
import { useRequest }                  from '@frontend/core/lib/hooks/useRequest';
import { useSelector }                 from 'react-redux';
import { T721AppState }                from '../../../redux';
import { v4 }                          from 'uuid';
import { DatesSearchResponseDto }      from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { DateEntity }                  from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { EventCategoryFetcher }        from './EventCategoryFetcher';

export interface EventDetailsProps {
    id: string;
}

export const EventDetails: React.FC<EventDetailsProps> = (props: EventDetailsProps): JSX.Element => {

    const {token} = useSelector((state: T721AppState) => ({token: state.auth.token?.value}));
    const [uuid] = useState(v4());

    const dateQuery = useRequest<DatesSearchResponseDto>({
        method: 'dates.search',
        args: [
            token,
            {
                id: {
                    $eq: props.id
                }
            }
        ],
        refreshRate: 100
    }, uuid);

    if (dateQuery.response.loading) {
        return <FullPageLoading width={250} height={250}/>
    }

    if (dateQuery.response.error) {
        return <Error message={'Cannot find event'}/>
    }


    const date: DateEntity = dateQuery.response.data.dates.length ? dateQuery.response.data.dates[0] : null;

    if (date === null) {
        return <Error message={'Cannot find event'}/>
    }

    return <EventCategoryFetcher date={date}/>

};
