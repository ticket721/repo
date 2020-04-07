import * as React from 'react';
import { withKnobs } from '@storybook/addon-knobs';
import TicketHeader from '../../src/components/ticket/header';
import TicketInfosCard from '../../src/components/ticket/cards/ticket-infos';
import styled from '../../config/styled';
import DateTimeCard from '../../src/components/ticket/cards/datetime';
import LocationCard from '../../src/components/ticket/cards/location';
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

export default {
  title: 'Ticket|Details',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  },
  component: TicketHeader
};

const PullUp = styled.div`
  margin-top: -100px;
  position: relative;
  z-index: 10;
`

export const Preview = () => (
  <div>
    <TicketHeader ticket={defaultTicket} fullWidth/>
    <PullUp>
      <TicketInfosCard
        eventName={defaultTicket.name}
        ticketType={defaultTicket.ticketType}
        ticketID={defaultTicket.ticketId}
        seatInfo={defaultTicket.seat}
      />
      <DateTimeCard
        endDate={defaultTicket.endDate}
        endTime={defaultTicket.endTime}
        iconColor={defaultTicket.mainColor}
        startDate={defaultTicket.startDate}
        startTime={defaultTicket.startTime}
        wSeparator
      />
      <LocationCard
        location={defaultTicket.location}
        address={defaultTicket.address}
        iconColor={defaultTicket.mainColor}
        wSeparator
      />
      <PurchaseInfosCard
        date={defaultTicket.purchase_date}
        iconColor={defaultTicket.mainColor}
        price={defaultTicket.price}
      />
    </PullUp>
  </div>
);
