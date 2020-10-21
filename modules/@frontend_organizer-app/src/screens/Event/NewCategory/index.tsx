import React, { useState }  from 'react';
import { useRequest }                  from '@frontend/core/lib/hooks/useRequest';
import { v4 }                       from 'uuid';
import { useHistory, useParams }    from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '@frontend/core/lib/redux';
import { DatesSearchResponseDto }        from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { checkFormatDate }               from '@frontend/core/lib/utils/date';
import { CategoryForm, CategoryItem }    from '../../../components/CategoryForm';
import { useDeepEffect }                 from '@frontend/core/lib/hooks/useDeepEffect';
import { PushNotification }              from '@frontend/core/lib/redux/ducks/notifications';
import { useLazyRequest }                from '@frontend/core/lib/hooks/useLazyRequest';

const NewCategory: React.FC = () => {
    const history = useHistory();
    const { groupId, dateId } = useParams();

    const [ loadingState, setLoadingState ] = useState<boolean>(false);
    const dispatch = useDispatch();
    const [uuid] = useState(v4() + '@create-category');
    const token = useSelector((state: AppState) => state.auth.token.value);
    const { response: dateResp } = useRequest<DatesSearchResponseDto>(
        {
            method: 'dates.search',
            args: [
                token,
                {
                    id: {
                        $eq: dateId
                    }
                }
            ],
            refreshRate: 1,
        },
        uuid
    );

    const { lazyRequest: createCategory, response: createResp } = useLazyRequest('categories.create', uuid);
    const { lazyRequest: addCategory, response: addCategoryResp } = useLazyRequest('dates.addCategories', uuid);

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

    useDeepEffect(() => {
        // if (createResp.data?.category) {
        //     addCategory([
        //         token,
        //         dateId,
        //         {
        //             categories: [createResp.data.category.id]
        //         }
        //     ]);
        // }
        console.error('addCategory');
    }, [createResp.data]);

    useDeepEffect(() => {
        if (addCategoryResp.data) {
            setLoadingState(false);
            dispatch(PushNotification('Successfuly updated', 'success'));
            console.error('implement history.push');
            // history.push(`/group/${groupId}/date/${dateId}/category/${createResp.data.category.id}`);
        }
    }, [addCategoryResp.data]);

    useDeepEffect(() => {
        if (createResp.error || addCategoryResp.error) {
            setLoadingState(false);
            dispatch(PushNotification('Create failed. Please retry', 'error'));
        }
    }, [createResp.error, addCategoryResp.error]);

    if (dateResp.data?.dates[0]) {
        return (
            <CategoryForm
            maxDate={checkFormatDate(dateResp.data.dates[0].timestamps.event_end)}
            loadingState={loadingState}
            confirm={create}/>
        )
    } else {
        return <span>loading...</span>
    }
};

export default NewCategory;
