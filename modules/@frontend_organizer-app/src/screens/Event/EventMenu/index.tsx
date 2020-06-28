import React, { useState } from 'react';
import styled                         from 'styled-components';

import { useHistory, useParams } from 'react-router';
import { Button, SelectInput }  from '@frontend/flib-react/lib/components';

import { SubMenu }                          from './SubMenu';
import { useRequest }                   from '@frontend/core/lib/hooks/useRequest';
import { useSelector }                  from 'react-redux';
import { MergedAppState }               from '../../../index';
import { DatesSearchResponseDto }       from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { v4 }                           from 'uuid';
import { useDeepEffect }                from '@frontend/core/lib/hooks/useDeepEffect';
import { checkFormatDate, displayDate } from '@frontend/core/lib/utils/date';
import { DateEntity }                   from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';

import { useTranslation }        from 'react-i18next';
import './locales';

interface DateOption {
    label: string;
    value: string;
}

const formatDateLabel = (startDate: string | Date, endDate: string | Date): string =>
    `${displayDate(checkFormatDate(startDate))} - ${displayDate(checkFormatDate(endDate))}`;

export const EventMenu: React.FC = () => {
    const [ t ] = useTranslation(['event_side_menu']);
    const history = useHistory();
    const [uuid] = useState<string>(v4() + '@event-menu');
    const token = useSelector((state: MergedAppState) => state.auth.token.value);
    const { groupId, dateId } = useParams();

    const [ selectableDates, setSelectableDates ] = useState<DateOption[]>(null);
    const [ selectedDate, setSelectedDate ] = useState<DateEntity>(null);

    const { response: datesResp } = useRequest<DatesSearchResponseDto>(
        {
            method: 'dates.search',
            args: [
                token,
                {
                    [dateId ? 'id' : 'group_id']: {
                        $eq: dateId || groupId,
                    }
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
                label: formatDateLabel(date.timestamps.event_begin, date.timestamps.event_end),
                value: date.id,
            })));
        }
    }, [datesResp]);

    return (
        <Container>
            {
                selectedDate ?
                <Actions>
                    <EventName>{selectedDate.metadata.name}</EventName>
                    <SelectInput
                    options={selectableDates}
                    value={[{
                        label: formatDateLabel(selectedDate.timestamps.event_begin, selectedDate.timestamps.event_end),
                        value: dateId,
                    }]}
                    onChange={(dateOpt: DateOption) => history.push(dateOpt.value)}/>
                    <Button
                        className='top'
                        variant='primary'
                        title={t('publish_label')}
                        onClick={() => console.log('publish')}
                    />
                    <Button
                        variant='secondary'
                        title={t('preview_label')}
                        onClick={() => console.log('preview')}
                    />
                </Actions> :
                    null
            }
            <Separator />
            <SubMenu/>
            <Separator />
            <Button
            title={'New Date'}
            variant={'primary'}
            onClick={() => history.push(`${groupId}/date`)}/>
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
  background-color: ${(props) => props.theme.darkerBg};

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

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  height: 190px;
  align-items: center;
  padding: 24px 0 12px 0;

  .top {
    margin-bottom: 8px;
  }
  button {
    margin: 0;
    width: calc(100% - 48px);
    span {
      margin: 0;
    }
  }
`;

const EventName = styled.span`
  width: 85%;
  font-weight: 500;
  font-size: 13px;
  color: ${(props) => props.theme.textColorDarker};
`;

const Title = styled.span`
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
  margin: 12px 0 12px 24px;
  color: ${(props) => props.theme.textColor};
`;
