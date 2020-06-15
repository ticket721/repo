// @ts-nocheck
import React from 'react';
import styled from 'styled-components';
import EventSideMenu from "./EventSideMenu";
import { PreviewInfos, TicketHeader } from "@frontend/flib-react/lib/components";

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
  setCurrentDate: (startDate: string) => void;
  name: string;
}

const EventPresentation = ({ currentDate, setCurrentDate, name }: Props) => {
  const category = dates.find((e) => e[0].name === name);

  return (
    <>
      <EventSideMenu name={name} currentDate={currentDate} setCurrentDate={setCurrentDate}/>
      <PageContainer>
        <Title>User preview</Title>
        <TicketContainer>
          <Ticket>
            <TicketHeader ticket={{...category[0], startDate: category[0].startDate.toDateString(), endDate: category[0].endDate.toDateString()}} />
            <Overlap>
              <PreviewInfos ticket={{...category[0], startDate: category[0].startDate.toDateString(), endDate: category[0].endDate.toDateString()}} />
            </Overlap>
          </Ticket>
        </TicketContainer>
      </PageContainer>
    </>
  );
};

const PageContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: calc(100% - 280px);
  margin-left: 280px;
`;

const TicketContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
`;

const Ticket = styled.div`
  width: 380px;
  margin-top: 20px;
  border-radius: 8px;
  overflow: hidden;
`;

const Overlap = styled.div`
  margin-top: -94px;
  position: relative;
  z-index: 1;
`;

const Title = styled.span`
  width: 100%;
  margin-bottom: 25px;
  font-weight: 500;
  font-size: 16px;
  color: ${(props) => props.theme.textColor};
  text-align: center;
`;

export default EventPresentation;
