import React from 'react';
import styled from 'styled-components';
import Button from "@frontend/flib-react/lib/components/button";
import SubMenu from "./SubMenu";

const dates = [
  {
    name: 'VIP',
    date: new Date(),
  },
  {
    name: 'VIP',
    date: new Date('2020-05-17T10:30:00'),
  },
  {
    name: 'VIP',
    date: new Date('2020-05-20T10:30:00'),
  },
  {
    name: 'VIP',
    date: new Date('2020-05-23T10:30:00'),
  },
  {
    name: 'VIP',
    date: new Date('2020-06-02T10:30:00'),
  },
  {
    name: 'VIP',
    date: new Date('2020-06-16T10:30:00'),
  },
];

interface Props {
  currentDate: string | undefined;
  setCurrentDate: (date: string) => void;
}

const EventSideMenu = ({ currentDate, setCurrentDate }: Props) => {
  return (
    <Container>
      <Actions>
        <EventName>{dates[0].name}</EventName>
        <SelectDate value={currentDate} onChange={(e) => setCurrentDate(e.target.value)}>
          {
            dates.map((e, i) => {
              const date = `${e.date.toDateString()} - ${e.date.getHours()}:${e.date.getMinutes()}`;
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
      <SubMenu type='information'/>
      <SubMenu type='tickets'/>
      <Title>Presentation</Title>
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
  position: absolute;
  left: 0;
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

export default EventSideMenu;
