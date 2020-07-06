import React, { useState } from 'react';
import { useRequest }                 from '@frontend/core/lib/hooks/useRequest';
import { v4 }                          from 'uuid';
import { useParams, useHistory }       from 'react-router';
import { useSelector }                 from 'react-redux';
import { MergedAppState }              from '../../../index';
import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { UpdateCategoryForm }          from './Form';
import { DatesSearchResponseDto }      from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { useDeepEffect } from '@frontend/core/lib/hooks/useDeepEffect';
import { checkFormatDate }             from '@frontend/core/lib/utils/date';

const UpdateCategory: React.FC = () => {
    const { dateId, categoryId } = useParams();
    const history = useHistory();

    const [uuid] = useState(v4() + '@update-category');
    const token = useSelector((state: MergedAppState) => state.auth.token.value);
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
        uuid
    );

    useDeepEffect(() => {
        if (categoryResp.data && categoryResp.data.categories.length === 0) {
            history.push('/');
        }
    }, [categoryResp.data]);

    if (categoryResp.data?.categories[0]) {
        return (
            <UpdateCategoryForm
                uuid={uuid}
                dateId={dateId}
                categoryId={categoryId}
                categoryName={categoryResp.data?.categories[0].display_name}
                initialValues={categoryResp.data.categories[0]}
                maxDate={checkFormatDate(dateResp.data.dates[0].timestamps.event_end)}
            />
        )
    } else {
        return <span>loading...</span>
    }
};

export default UpdateCategory;
