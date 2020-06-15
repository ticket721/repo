import React from 'react';
import styled from 'styled-components';
import Button from "@frontend/flib-react/lib/components/button";
import Icon from "@frontend/flib-react/lib/components/icon";
import SubMenu from "./SubMenu";

import { dates } from "../fakeData";

interface Props {
  currentDate: string | undefined;
  setCurrentDate: (date: string) => void;
  setPage: (page: string) => void;
  name: string;
}

const EventSideMenu = ({ currentDate, setCurrentDate, setPage, name }: Props) => {
  const category = dates.find((e) => e[0].name === name);

  return (
    <Container>
      <BackIcon onClick={() => setCurrentDate(undefined)}>
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
            // @ts-ignore
            category.map((e, i) => {
              const date = `${e.startDate.toDateString()} - ${e.startDate.getHours()}:${e.startDate.getMinutes()}`;
              return (
                <option key={`side-menu-${e.name}-${date}-${i}`} value={date}>
                  {date}
                </option>
              );
              }
            )
          }
        </SelectDate>
        <Button
          className="top"
          variant="primary"
          title="Publish Event"
          onClick={() => console.log('publish')}
        />
        <Button
          variant="secondary"
          title="Preview Event"
          onClick={() => console.log('publish')}
        />
      </Actions>
      <Separator />
      <SubMenu type='information' setPage={setPage}/>
      <SubMenu type='tickets' setPage={setPage}/>
      <Title onClick={() => setPage('presentation')}>Presentation</Title>
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
