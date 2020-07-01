import React, { useState }             from 'react';
import { useParams, useHistory }       from 'react-router';
import { useTranslation }              from 'react-i18next';
import { useSelector }                 from 'react-redux';
import { v4 }                          from 'uuid';

import { useDeepEffect }               from '@frontend/core/lib/hooks/useDeepEffect';
import { useRequest }                  from '@frontend/core/lib/hooks/useRequest';
import { AppState }                    from '@frontend/core/src/redux/ducks';
import { DatesSearchResponseDto }      from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';

import '../../../shared/Translations/global';

const FetchDate = (): JSX.Element => {
  const [ t ] = useTranslation('global');
  const [uuid] = useState(v4() + '@fetchDate');
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

  useDeepEffect(() => {
    if (groupId.match(/0x(([a-zA-Z]|[0-9])+)/)) {
      if (!datesResp.loading && !datesResp.error && datesResp.data.dates) {
        const filteredDate = datesResp.data.dates?.filter(d => d.parent_type === 'event' || d.parent_type === 'date')
        if (filteredDate?.[0]?.id) {
          history.push(`/${groupId}/date/${filteredDate?.[0]?.id}`);
        } else {
          history.push('/');
        }
      }
    }
  }, [datesResp]);

  if (groupId.match(/0x(([a-zA-Z]|[0-9])+)/)) {
    return (
      <>
        {t('loading')}
      </>
    );
  } else {
    return (<></>);
  }
};

export default FetchDate;
