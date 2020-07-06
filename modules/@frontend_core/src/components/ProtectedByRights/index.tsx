import React, { useState }         from 'react';
import { useParams, useHistory }   from 'react-router';
import { v4 }                      from 'uuid';
import { useSelector }             from 'react-redux';

import { RightsSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/rights/dto/RightsSearchResponse.dto';

import { useRequest }              from '../../hooks/useRequest';
import { AppState }                from '../../redux/ducks';

const ProtectedByRights = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const { groupId } = useParams();
  const history = useHistory();

  const [uuid] = useState(v4() + '@protectedByRights');
  const token = useSelector((state: AppState): string => state.auth.token.value);

  const { response: eventRights } = useRequest<RightsSearchResponseDto>({
      method: 'rights.search',
      args: [
        token,
        {
          entity_type: {
            $eq: 'event'
          }
        }
      ],
      refreshRate: 5
    },
  uuid);

  if (eventRights.loading) {
    return <>Loading...</>;
  }
  if (eventRights.data.rights.find(r => r.entity_value === groupId)?.rights.owner === true) {
    return <>{ children }</>
  } else {
    history.push('/');
    return <></>;
  }

}

export default ProtectedByRights;
