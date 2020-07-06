import React, { useState }  from 'react';
import { useRequest }                  from '@frontend/core/lib/hooks/useRequest';
import { v4 }                       from 'uuid';
import { useHistory, useParams }    from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { MergedAppState }                 from '../../../index';
import { DatesSearchResponseDto }     from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { checkFormatDate, year }      from '@frontend/core/lib/utils/date';
import { CategoryForm, CategoryItem } from '../../../components/CategoryForm';
import { useDeepEffect }                  from '@frontend/core/lib/hooks/useDeepEffect';
import { PushNotification }               from '@frontend/core/lib/redux/ducks/notifications';
import { useLazyRequest }                 from '@frontend/core/lib/hooks/useLazyRequest';
import {
    CategoriesCreateResponseDto
}    from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesCreateResponse.dto';
import { EventsAddCategoriesResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsAddCategoriesResponse.dto';

const NewGlobalCategory: React.FC = () => {
    const history = useHistory();
    const { groupId, eventId } = useParams();

    const [ loadingState, setLoadingState ] = useState<boolean>(false);
    const dispatch = useDispatch();
    const [uuid] = useState(v4() + '@create-global-category');
    const token = useSelector((state: MergedAppState) => state.auth.token.value);
    const { response: dateResp } = useRequest<DatesSearchResponseDto>(
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
        uuid
    );

    const { lazyRequest: createCategory, response: createResp } = useLazyRequest<CategoriesCreateResponseDto>('categories.create', uuid);
    const { lazyRequest: addCategory, response: addCategoryResp } = useLazyRequest<EventsAddCategoriesResponseDto>('events.addCategories', uuid);

    const create = (values: CategoryItem) => {
        setLoadingState(true);
        createCategory([
            token,
            {
                group_id: groupId,
                display_name: values.name,
                prices: values.currencies,
                seats: values.seats,
                sale_begin: values.saleBegin,
                sale_end: values.saleEnd,
                resale_begin: values.saleBegin,
                resale_end: values.saleEnd,
            }
        ], {
            force: true
        })
    };

    const getMaxDate = (): Date => {
        const sortedDates = dateResp.data.dates.sort((dateA, dateB) =>
            checkFormatDate(dateB.timestamps.event_end).getTime() - checkFormatDate(dateA.timestamps.event_end).getTime());
        return checkFormatDate(sortedDates[0].timestamps.event_end);
    };

    useDeepEffect(() => {
        if (createResp.data?.category) {
            addCategory([
                token,
                eventId,
                {
                    categories: [createResp.data.category.id]
                }
            ]);
        }
    }, [createResp.data]);

    useDeepEffect(() => {
        if (addCategoryResp.data) {
            setLoadingState(false);
            dispatch(PushNotification('Successfuly updated', 'success'));
            history.push(`/group/${groupId}/event/${eventId}/category/${createResp.data.category.id}`, {
                showingGlobalCategories: true
            })
        }
    }, [addCategoryResp.data]);

    useDeepEffect(() => {
        if (createResp.error || addCategoryResp.error) {
            setLoadingState(false);
            dispatch(PushNotification('Create failed. Please retry', 'error'));
        }
    }, [createResp.error, addCategoryResp.error]);

    useDeepEffect(() => {
        if (dateResp.data && dateResp.data.dates.length === 0) {
            history.push('/');
        }
    }, [dateResp.data]);

    return (
        <CategoryForm
            maxDate={dateResp.data?.dates.length > 0 ?
                getMaxDate():
            new Date(Date.now() + year)}
            loadingState={loadingState}
            confirm={create}/>
    )
};

export default NewGlobalCategory;
