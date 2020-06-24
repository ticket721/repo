import React from 'react';
import styled from 'styled-components';

import { useHistory } from 'react-router';
import { useTranslation } from 'react-i18next';
import Button from '@frontend/flib-react/lib/components/button';
import Icon from '@frontend/flib-react/lib/components/icon';

import { formatDateForDisplay } from '../../../utils/functions';
import { Events } from '../../../types/UserEvents';

import SubMenu from './SubMenu';
import './locales';

interface Props {
  currentDate: string | undefined;
  setCurrentDate: (date: string) => void;
  setName: (name: string) => void;
  name: string;
  userEvents: Events[];
}

const EventSideMenu = ({ currentDate, setCurrentDate, setName, name, userEvents }: Props) => {
  const [ t ] = useTranslation(['event_side_menu']);
  const category = userEvents.find((e) => e.name === name);
  const history = useHistory();

  const handleClick = (page: string) => {
    const id = history.location.pathname.match(/^\/0x([a-zA-Z]|[0-9])+/);
    history.push(`${id[0]}/${page}`);
  };


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
        <SelectDate value={currentDate} onChange={(e) => setCurrentDate(e.target.value)}>
          {
            category.dates.map((e, i) => {
              const date = e.startDate ? formatDateForDisplay(e.startDate) : 'Premium';

              return (
                <option key={`side-menu-${e.id}-${i}`} value={date}>
                  {date}
                </option>
              );
              }
            )
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
      { currentDate !== 'Premium' && <SubMenu type='information'/>}
      <SubMenu type='tickets'/>
      <Title onClick={() => handleClick('presentation')}>{t('presentation_title')}</Title>
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
