import React from 'react';
import styled from 'styled-components';
import Button from "@frontend/flib-react/lib/components/button";
import SubMenu from "./SubMenu";

const dates = [
  [
    {
      name: 'VIP',
      src: 'superImage',
      price: '120',
      mainColor: '#00bfff',
      location: 'La Maroquinerie',
      address: '23 Rue Boyer, 75020 Paris',
      number: 23,
      ticketType: 'Gold Ticket',
      gradients: ['#00bfff', '#007399'],
      startTime: `${new Date().getHours()}:${new Date().getMinutes()}`,
      startDate: new Date(),
      endDate: new Date(),
      endTime: `${new Date().getHours()}:${new Date().getMinutes()}`,
      ticketId: 'ticketId1',
      addOns: 1,
      image: 'superImage',
    },
    {
      name: 'VIP',
      startDate: new Date('2020-05-17T10:30:00'),
    },
    {
      name: 'VIP',
      startDate: new Date('2020-05-20T10:30:00'),
    },
    {
      name: 'VIP',
      startDate: new Date('2020-05-23T10:30:00'),
    },
    {
      name: 'VIP',
      startDate: new Date('2020-06-02T10:30:00'),
    },
    {
      name: 'VIP',
      startDate: new Date('2020-06-16T10:30:00'),
    },
  ],
  [
    {
      name: 'Weekend',
      startDate: new Date('2020-06-10T10:30:00'),
      src: 'superImage',
      price: '80',
      mainColor: '#aef667',
      location: 'La Maroquinerie',
      address: '23 Rue Boyer, 75020 Paris',
      number: 23,
      ticketType: 'Gold Ticket',
      gradients: ['#aef667', '#85af5b'],
      startTime:`${new Date('2020-06-10T10:30:00').getHours()}:${new Date().getMinutes()}`,
      endDate: new Date('2020-06-10T11:30:00').toDateString(),
      endTime: `${new Date('2020-06-10T11:30:00').getHours()}:${new Date().getMinutes()}`,
      ticketId: 'ticketId2',
      addOns: 1,
      image: 'superImage',

    },
    {
      name: 'Weekend',
      startDate: new Date('2020-05-17T10:30:00'),
    },
    {
      name: 'Weekend',
      startDate: new Date('2020-05-20T10:30:00'),
    },
    {
      name: 'Weekend',
      startDate: new Date('2020-05-23T10:30:00'),
    },
  ],
  [
    {
      name: 'Early bird',
      startDate: new Date('2020-06-02T10:30:00'),
      src: 'superImage',
      price: '70',
      mainColor: '#ee8046',
      location: 'La Maroquinerie',
      address: '23 Rue Boyer, 75020 Paris',
      number: 23,
      ticketType: 'Gold Ticket',
      gradients: ['#ee8046', '#a36849'],
      startTime: `${new Date('2020-06-02T10:30:00').getHours()}:${new Date().getMinutes()}`,
      endDate: new Date('2020-06-02T12:30:00').toDateString(),
      endTime:`${new Date('2020-06-02T12:30:00').getHours()}:${new Date().getMinutes()}`,
      ticketId: 'ticketId3',
      addOns: 1,
      image: 'superImage',

    },
    {
      name: 'Early bird',
      startDate: new Date('2020-06-16T10:30:00'),
    },
  ],
  [
    {
      name: 'test',
      startDate: new Date('2020-06-02T10:30:00'),
      src: 'superImage',
      price: '12',
      mainColor: '#7f42f3',
      location: 'La Maroquinerie',
      address: '23 Rue Boyer, 75020 Paris',
      number: 23,
      ticketType: 'Gold Ticket',
      gradients: ['#7f42f3', '#4d2992'],
      startTime: `${new Date('2020-06-02T09:30:00').getHours()}:${new Date().getMinutes()}`,
      endDate: new Date('2020-06-02T10:30:00').toDateString(),
      endTime: `${new Date('2020-06-02T10:30:00').getHours()}:${new Date().getMinutes()}`,
      ticketId: 'ticketId4',
      addOns: 1,
      image: 'superImage',

    },
    {
      name: 'test',
      startDate: new Date('2020-06-16T10:30:00'),
    },
  ],
];

interface Props {
  currentDate: string | undefined;
  setCurrentDate: (date: string) => void;
  name: string;
}

const EventSideMenu = ({ currentDate, setCurrentDate, name }: Props) => {
  const category = dates.find((e) => e[0].name === name);

  return (
    <Container>
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
  top: 0;
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
