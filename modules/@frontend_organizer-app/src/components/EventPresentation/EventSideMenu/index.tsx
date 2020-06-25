import React, { useState } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { v4 } from 'uuid';

import { DatesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { useRequest } from '@frontend/core/lib/hooks/useRequest';
import { useDeepEffect } from '@frontend/core/lib/hooks/useDeepEffect';
import { AppState } from '@frontend/core/src/redux/ducks';
import Button from '@frontend/flib-react/lib/components/button';
import Icon from '@frontend/flib-react/lib/components/icon';

import { formatDateForDisplay } from '../../../utils/functions';

import SubMenu from './SubMenu';
import './locales';

interface Props {
  currentDate: string | undefined;
  setCurrentDate: (date: string) => void;
  setName: (name: string) => void;
  name: string;
}

const EventSideMenu = ({ currentDate, setCurrentDate, setName, name }: Props) => {
  const { group_id } = useParams();
  const [options, setOptions] = useState<{ value: string, label: string}[]>([{ value: '...', label: '...'}]);
  const [ t ] = useTranslation(['event_side_menu']);
  const history = useHistory();
  const [uuid] = React.useState(v4());
  const token = useSelector((state: AppState): string => state.auth.token.value);
  const { response } = useRequest<DatesSearchResponseDto>(
    {
      method: 'dates.search',
      args: [
        token,
        {
          group_id: {
            $eq: group_id,
          },
          $page_size: 100
        },
      ],
      refreshRate: 1,
    },
    uuid
  );

  const handleClick = (page: string) => {
    const id = history.location.pathname.match(/^\/0x([a-zA-Z]|[0-9])+/);
    history.push(`${id[0]}/${page}`);
  };

  useDeepEffect(() => {
    if (!response.error && !response.loading && response.data) {
      const dates = response.data.dates.map(date => (
        { value: date.id, label: formatDateForDisplay(date.timestamps.event_begin)}
      ));
      setOptions(dates);
    }
  }, [response]);

  return (
    <Container>
      <BackIcon onClick={() => {
        setCurrentDate(undefined);
        setName(undefined);
        history.push('/');
      }}>
        <Icon
          icon={'back-arrow'}
          size={'14px'}
          color={'rgba(255, 255, 255, 0.9)'}
        />
      </BackIcon>
      <Actions>
        <EventName>{name}</EventName>
        <SelectDate value={currentDate} onChange={(e) => {
          setCurrentDate(e.target.value);
        }}>
          {
            options.map(option => (
                <option key={`side-menu-${option.value}`} value={option.value}>
                  {option.label}
                </option>
            ))
          }
        </SelectDate>
        <Button
          className='top'
          variant='primary'
          title={t('publish_label')}
          onClick={() => console.log('publish')}
        />
        <Button
          variant='secondary'
          title={t('preview_label')}
          onClick={() => console.log('publish')}
        />
      </Actions>
      <Separator />
      <Title onClick={() => handleClick('informations')}>{t('information_title')}</Title>
      <SubMenu />
      <Title onClick={() => handleClick('presentation')}>{t('presentation_title')}</Title>
      <Separator />
      <Title onClick={() => handleClick('add-date')}>{t('add_date_title')}</Title>
      <Separator />
    </Container>
  )
};

const SelectDate = styled.select`
  display: flex;
  padding: 0;
  margin: 5px 0 12px 0;
  width: 85%;
  font-weight: bold;
  font-size: 15px;
`;

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

const BackIcon = styled.div`
  padding: 20px 12px 0 10px;
  cursor: pointer;
`;

export default EventSideMenu;
