import React, { useState }                      from 'react';
import { useTranslation }                       from 'react-i18next';
import styled                                   from 'styled-components';
import { useHistory, useParams }                from 'react-router';
import { v4 }                                   from 'uuid';
import { useSelector, useDispatch }             from 'react-redux';


import { DatesSearchResponseDto }               from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { DateEntity }                           from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { Button }                               from '@frontend/flib-react/lib/components';
import { useRequest }                           from '@frontend/core/lib/hooks/useRequest';
import { useLazyRequest }                       from '@frontend/core/lib/hooks/useLazyRequest';
import { useDeepEffect }                        from '@frontend/core/lib/hooks/useDeepEffect';
import { checkFormatDate, displayCompleteDate } from '@frontend/core/lib/utils/date';
import { PushNotification }                     from '@frontend/core/lib/redux/ducks/notifications';

import { MergedAppState } from '../../../index';

import { SubMenu }                              from './SubMenu';
import { DateSelect }                           from './DateSelect';
import './locales';

interface DateOption {
    label: string;
    value: string;
}

const formatDateLabel = (date: string | Date): string =>
    `${displayCompleteDate(checkFormatDate(date))}`;

export const EventMenu: React.FC = () => {
    const [ t ] = useTranslation(['event_side_menu']);
    const history = useHistory();
    const [uuid] = useState<string>(v4() + '@event-menu');
    const [uuidDelete] = useState<string>(v4() + '@event-menu');
    const token = useSelector((state: MergedAppState) => state.auth.token.value);
    const { groupId, dateId } = useParams();
    const dispatch = useDispatch();
    const [eventId, setEventId] = useState<string>(null);

    const [ selectableDates, setSelectableDates ] = useState<DateOption[]>(null);
    const [ selectedDate, setSelectedDate ] = useState<DateEntity>(null);
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
            const currentDate: DateEntity = datesResp.data.dates.find((date) => date.id === dateId);
            setSelectedDate(currentDate);
            setSelectableDates(datesResp.data.dates.map((date) => ({
                label: formatDateLabel(date.timestamps.event_begin),
                value: date.id,
            })));
        }
    }, [datesResp]);

    useDeepEffect(() => {
      if (deleteDateResp.called) {
        if (!deleteDateResp.error && !deleteDateResp.loading) {
          history.push(`/${groupId}`);
          dispatch(PushNotification(t('success'), 'success'));
        } else {
          dispatch(PushNotification(t('error'), 'error'));
        }
      }
    }, [deleteDateResp]);
    //0x(([a-zA-Z]|[0-9])+)\/category

    return (
        <Container>
            <DateActions>
                <Header>
                    <Title>{dateId && selectedDate ? selectedDate.metadata.name : 'New Date'}</Title>
                    {dateId && selectedDate && <DateSelect
                        menuPosition={{
                          top: '-24px',
                          left: '250px'
                        }}
                        options={selectableDates}
                        value={[{
                          label: formatDateLabel(selectedDate.timestamps.event_begin),
                          value: dateId,
                        }]}
                        onChange={(dateOpt: DateOption) => history.push(`/${groupId}/date/${dateOpt.value}`)}/>
                    }
                </Header>
                <Button
                    variant={dateId ? 'primary' : 'disabled'}
                    title={t('publish_label')}
                    onClick={() => console.log('publish')}
                />
                <Button
                    variant={dateId ? 'secondary' : 'disabled'}
                    title={t('preview_label')}
                    onClick={() => history.push(`/${groupId}/date/${dateId}`)}
                />
            </DateActions>
            <Separator/>
            <SubMenu/>
            <Separator/>
            <LastSection>
                <Button
                    title={'New Date'}
                    variant={dateId ? 'primary' : 'disabled'}
                    onClick={() => history.push(`/${groupId}/date`)}/>
                <Button
                  title={datesResp.data?.dates?.length > 1 ? 'Delete Date' : 'Delete Event'}
                  variant={'danger'}
                  onClick={() => { deleteDate([token, eventId, { dates: [dateId] }]) }}/>
            </LastSection>
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

const Separator = styled.div`
  height: 2px;
  width: 100%;
  margin: 12px 0;
  background: rgba(10, 8, 18, 0.3);
`;

const DateActions = styled.div`
    margin: 0 ${props => props.theme.biggerSpacing};

    & > button {
        margin: 0 0 ${props => props.theme.smallSpacing};
        width: 100%;
    }
`;

const Header = styled.div`
    border-left: 2px solid ${(props) => props.theme.componentColorLighter};
    margin-bottom: ${props => props.theme.biggerSpacing};
    padding: 2px 0 2px ${props => props.theme.regularSpacing};
`;

const Title = styled.span`
  font-weight: 500;
  font-size: 13px;
  display: block;
  margin-bottom: 4px;
  color: ${(props) => props.theme.textColorDarker};
`;

const LastSection = styled.div`
    margin: 0 ${props => props.theme.biggerSpacing};

    & > span {
        padding-top: ${props => props.theme.regularSpacing};
        font-size: 13px;
        font-weight: 500;
        color: ${(props) => props.theme.textColorDarker};
    }
`;
