import React, { useState }             from 'react';
import { useParams, useHistory }       from 'react-router';
import { useTranslation }              from 'react-i18next';
import { useSelector }                 from 'react-redux';
import { v4 }                          from 'uuid';


import { useDeepEffect }               from '@frontend/core/lib/hooks/useDeepEffect';
import { useRequest }                  from '@frontend/core/lib/hooks/useRequest';
import { AppState }                    from '@frontend/core/src/redux/ducks';
import { useLazyRequest }              from '@frontend/core/lib/hooks/useLazyRequest';
import { DatesSearchResponseDto }      from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { CategoriesSearchResponseDto } from "@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto";

import '../../../shared/Translations/global';

const FetchDate = () => {
  const [ t ] = useTranslation('global');
  const [uuid] = useState(v4() + '@fetchDate-date');
  const [uuidCategories] = useState(v4() + '@fetchDate-categories');
  const token = useSelector((state: AppState): string => state.auth.token.value);
  const { groupId } = useParams();
  const history = useHistory();


  const { response: datesResp } = useRequest<DatesSearchResponseDto>(
    {
      method: 'dates.search',
      args: [
        token,
        {
          group_id: {
            $eq: groupId,
          }
        },
      ],
      refreshRate: 5,
    },
    uuid
  );
  const { lazyRequest: getCategories, response: categoriesRes } = useLazyRequest<CategoriesSearchResponseDto>('categories.search', uuidCategories);

  useDeepEffect(() => {
    if (groupId.match(/0x(([a-zA-Z]|[0-9])+)/)) {
      if (!datesResp.loading && !datesResp.error && datesResp.data.dates) {
        const filteredDate = datesResp.data.dates?.filter(d => d.parent_type === 'event' || d.parent_type === 'date')
        if (filteredDate?.[0]?.id) {
          history.push(`/${groupId}/date/${filteredDate?.[0]?.id}`);
        } else {
          getCategories([token, {
            group_id: {
              $eq: groupId,
            }
          }]);
        }
      }
    }
  }, [datesResp]);

  useDeepEffect(() => {
    if (categoriesRes.called && !categoriesRes.loading && !categoriesRes.error && categoriesRes.data.categories) {
      const filteredCategories = categoriesRes.data.categories.filter(c => c.parent_type === 'event' || c.parent_type === 'date')
      if (filteredCategories?.[0]?.id) {
        history.push(`/${groupId}/category/${filteredCategories?.[0]?.id}`);
      } else {
        history.push(`/`);
      }

    }

  }, [categoriesRes]);

  if (groupId.match(/0x(([a-zA-Z]|[0-9])+)/)) {
    return (
      <>
        {t('loading')}
      </>
    );
  } else {
    return null;
  }
};

export default FetchDate;
