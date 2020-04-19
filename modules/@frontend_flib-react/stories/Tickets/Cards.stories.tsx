import * as React from 'react';
import { withKnobs } from '@storybook/addon-knobs';
import DateTimeCard from '../../src/components/ticket/cards/datetime';
import LocationCard from '../../src/components/ticket/cards/location';
import SponsorsCard  from '../../src/components/ticket/cards/sponsors';
import TicketInfosCard from '../../src/components/ticket/cards/ticket-infos';
import PurchaseInfosCard from '../../src/components/ticket/cards/purchase-infos';

const defaultTicket = {
  name: 'Tall Heights - 2020 tour',
  location: 'Philharmonie de Paris',
  address: '221 avenue Jean Jaurès, Paris',
  number: 12,
  ticketType: '2 Days pass',
  startDate: '2020/02/14',
  endDate: '2020/20/15',
  startTime: '2:00PM',
  endTime: '4:00PM',
  gradients: ['#EBBC16', '#DB535B'],
  mainColor: '#EBBC16',
  addOns: 2,
  image: '/assets/images/ticket-1.jpg',
  ticketId: '00251501AS-D04546SD',
  seat: {
    block: 'A',
    row: 'A3',
    number: 53,
  },
  purchase_date: '2020/04/07',
  price: '$135'
}

const sponsorsList = [
  {
    id: 1,
    name: 'XLive',
    logo: 'assets/images/logo--xlive.png'
  },
  {
    id: 2,
    name: 'iHeart',
    logo: 'assets/images/logo--iheart.png'
  },
  {
    id: 3,
    name: 'Corus',
    logo: 'assets/images/logo--corus.png'
  },
  {
    id: 4,
    name: 'SXSW',
    logo: 'assets/images/logo--sxsw.png'
  }
];

export default {
  title: 'Ticket|Cards',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

export const DateTime = () => (
  <DateTimeCard
    endDate={defaultTicket.endDate}
    endTime={defaultTicket.endTime}
    iconColor={defaultTicket.mainColor}
    startDate={defaultTicket.startDate}
    startTime={defaultTicket.startTime}
  />
);

export const DateTimeWithLink = () => (
  <DateTimeCard
    endDate={defaultTicket.endDate}
    endTime={defaultTicket.endTime}
    iconColor={defaultTicket.mainColor}
    startDate={defaultTicket.startDate}
    startTime={defaultTicket.startTime}
    link="linkto"
    linkLabel="View more dates"
  />
);


export const Location = () => (
  <LocationCard
    location={defaultTicket.location}
    address={defaultTicket.address}
    iconColor={defaultTicket.mainColor}
  />
);


export const LocationWithLink = () => (
  <LocationCard
    location={defaultTicket.location}
    address={defaultTicket.address}
    iconColor={defaultTicket.mainColor}
    link='direction'
    linkLabel='Get directions'
  />
);

export const TicketInformations = () => (
  <TicketInfosCard
    eventName={defaultTicket.name}
    ticketType={defaultTicket.ticketType}
    ticketID={defaultTicket.ticketId}
    seatInfo={defaultTicket.seat}
  />
);

export const PurchaseInfos = () => (
  <PurchaseInfosCard
    date={defaultTicket.purchase_date}
    iconColor={defaultTicket.mainColor}
    price={defaultTicket.price}
    wSeparator
  />
)

export const Sponsors = () => (
  <SponsorsCard
    title='Sponsors'
    sponsors={sponsorsList}
  />
)
