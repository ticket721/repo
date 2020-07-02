import React, { useState }          from 'react';
import { useTranslation }           from 'react-i18next';
import { useHistory, useParams }    from 'react-router';
import { v4 }                       from 'uuid';
import { useSelector, useDispatch } from 'react-redux';
import styled                       from 'styled-components';

import { useLazyRequest }           from '@frontend/core/lib/hooks/useLazyRequest';
import { useRequest }               from '@frontend/core/lib/hooks/useRequest';
import { DatesSearchResponseDto }   from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { useDeepEffect }            from '@frontend/core/lib/hooks/useDeepEffect';
import { PushNotification }         from '@frontend/core/lib/redux/ducks/notifications';
import { DateEntity }               from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { Button }                   from '@frontend/flib-react/lib/components';
import { MergedAppState }           from '../../../../index';

export const Actions = () => {
  const { dateId, groupId } = useParams();
  const history = useHistory();
  const [ t ] = useTranslation(['date_actions']);
  const [uuid] = useState<string>(v4() + '@event-menu-dates.search');
  const [uuidDelete] = useState<string>(v4() + '@event-menu-dates.delete');
  const token = useSelector((state: MergedAppState) => state.auth.token.value);
  const dispatch = useDispatch();
  const [eventId, setEventId] = useState<string>(null);

  const { lazyRequest: deleteDate, response: deleteDateResp } = useLazyRequest('events.deleteDates', uuidDelete);

  const { response: datesResp } = useRequest<DatesSearchResponseDto>(
    {
      method: 'dates.search',
      args: [
        token,
        {
          group_id: {
            $eq: groupId,
          },
        },
      ],
      refreshRate: 5,
    },
    uuid
  );

  useDeepEffect(() => {
    if (datesResp.data && datesResp.data.dates.length > 0) {
      const filteredDates = datesResp.data.dates.filter(d => d.parent_type === 'event' || d.parent_type === 'date');
      const currentDate: DateEntity = filteredDates.find((date) => date.id === dateId);
      setEventId(currentDate?.parent_id);
    }
  }, [datesResp]);

  useDeepEffect(() => {
    if (deleteDateResp.called && !deleteDateResp.loading) {
      if (!deleteDateResp.error) {
        history.push(`/${groupId}`);
        dispatch(PushNotification(t('success'), 'success'));
      } else {
        dispatch(PushNotification(t('error'), 'error'));
      }
    }
  }, [deleteDateResp]);

  return (
    <>
      <Separator/>
      <ButtonContainer>
        <Button
          title={t('add_label')}
          variant='primary'
          onClick={() => history.push(`/${groupId}/event/${eventId}/date`)}
        />
        <Button
          variant={dateId ? 'danger' : 'disabled'}
          title={datesResp.data?.dates?.length > 1 ? t('delete_date_label') : t('delete_event_label')}
          onClick={() => { deleteDate([token, eventId, { dates: [dateId] }]) }}
        />
      </ButtonContainer>
    </>
  );
};

const ButtonContainer = styled.div`
  margin: 0 ${props => props.theme.biggerSpacing};
`;

const Separator = styled.div`
  height: 2px;
  width: 100%;
  margin: 12px 0;
  background: rgba(10, 8, 18, 0.3);
`;
