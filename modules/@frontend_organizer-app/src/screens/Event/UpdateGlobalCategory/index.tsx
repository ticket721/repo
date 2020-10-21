import React, { useState }             from 'react';
import { useRequest }                  from '@frontend/core/lib/hooks/useRequest';
import { v4 }                          from 'uuid';
import { useParams, useHistory }       from 'react-router';
import { useSelector }                 from 'react-redux';
import { AppState } from '@frontend/core/lib/redux';
import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { UpdateGlobalCategoryForm }          from './Form';
import { DatesSearchResponseDto }      from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { EventsSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsSearchResponse.dto';
import { checkFormatDate }             from '@frontend/core/lib/utils/date';
import { useDeepEffect } from '@frontend/core/lib/hooks/useDeepEffect';

const UpdateGlobalCategory: React.FC = () => {
    const { eventId, categoryId } = useParams();
    const history = useHistory();

    const [uuid] = useState(v4() + '@update-global-category-events.search');
    const [uuidDate] = useState(v4() + '@update-global-category-dates.search');
    const [uuidCategory] = useState(v4() + '@update-global-category-categories.search');
    const token = useSelector((state: AppState) => state.auth.token.value);
    const [ maxDate, setMaxDate ] = useState<Date>(null);
    const { response: eventResp } = useRequest<EventsSearchResponseDto>(
        {
            method: 'events.search',
            args: [
                token,
                {
                    id: {
                        $eq: eventId
                    }
                }
            ],
            refreshRate: 1,
        },
        uuid
    );
    const { response: datesResp } = useRequest<DatesSearchResponseDto>(
        {
            method: 'dates.search',
            args: [
                token,
                {
                    parent_id: {
                        $eq: eventId
                    }
                }
            ],
            refreshRate: 1,
        },
        uuidDate
    );

    const { response: categoryResp } = useRequest<CategoriesSearchResponseDto>(
        {
            method: 'categories.search',
            args: [
                token,
                {
                    id: {
                        $eq: categoryId
                    }
                }
            ],
            refreshRate: 1,
        },
        uuidCategory
    );

    useDeepEffect(() => {
        if (datesResp.data) {
            const sortedDates = datesResp.data.dates.sort((dateA, dateB) =>
                checkFormatDate(dateB.timestamps.event_end).getTime() - checkFormatDate(dateA.timestamps.event_end).getTime());
            setMaxDate(checkFormatDate(sortedDates?.[0]?.timestamps.event_end));
        }
    }, [datesResp.data]);

    useDeepEffect(() => {
        if (categoryResp.data && categoryResp.data.categories.length === 0) {
            history.push('/');
        }
    }, [categoryResp.data]);

    useDeepEffect(() => {
        if (eventResp.data && eventResp.data.events.length === 0) {
            history.push('/');
        }
    }, [eventResp.data]);

    if (categoryResp.data?.categories[0] && maxDate) {
        return (
            <UpdateGlobalCategoryForm
                uuid={uuid}
                eventId={eventId}
                categoryId={categoryId}
                categoryName={categoryResp.data.categories[0].display_name}
                initialValues={categoryResp.data.categories[0]}
                maxDate={maxDate}
            />
        )
    } else {
        return <span>loading...</span>
    }
};

export default  UpdateGlobalCategory;
