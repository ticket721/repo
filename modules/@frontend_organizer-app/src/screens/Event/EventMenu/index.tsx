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

import { MergedAppState }           from '../../../index';

import { Dropdown }                 from './Dropdown';
import { DateSubMenu }              from './DateSubMenu';
import { GlobalSubMenu }            from './GlobalSubMenu';
import { DateActions }              from './DateActions';
import './locales';

export const EventMenu: React.FC = () => {
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
        <Container>
            <Dropdown/>
            {
                dateId &&
                    <>
                        <DateActions/>
                        <Separator/>
                        <DateSubMenu/>
                        <Separator/>
                    </>
            }
            <GlobalSubMenu/>
            {
                dateId && (
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
                )
            }
        </Container>
    )
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 280px;
  height: calc(100vh - 80px);
  position: fixed;
  left: 0;
  top: 81px;
  padding: ${props => props.theme.biggerSpacing} 0;
  background-color: ${(props) => props.theme.darkerBg};
  z-index: 3;

  button {
    outline: none;
  }
`;

const ButtonContainer = styled.div`
  margin: 0 ${props => props.theme.biggerSpacing};
`;

const Separator = styled.div`
  height: 2px;
  width: 100%;
  margin: 12px 0;
  background: rgba(10, 8, 18, 0.3);
`;
