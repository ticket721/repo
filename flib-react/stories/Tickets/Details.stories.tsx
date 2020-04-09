import * as React from 'react';
import { withKnobs } from '@storybook/addon-knobs';
import TicketHeader from '../../src/components/ticket/header';
import TicketInfosCard from '../../src/components/ticket/cards/ticket-infos';
import styled from '../../config/styled';
import Gradient from '../../src/components/elements/gradient';
import DateTimeCard from '../../src/components/ticket/cards/datetime';
import LocationCard from '../../src/components/ticket/cards/location';
import TitleText from '../../src/components/ticket/cards/title-text'
import PurchaseInfosCard from '../../src/components/ticket/cards/purchase-infos';
import SponsorsCard from '../../src/components/ticket/cards/sponsors';
import QrCodeButton from '../../src/components/ticket/qr-code';
import LinkButton from '../../src/components/ticket/link-button';
import TopNav from '../../src/components/ticket/top-nav';

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
  gradients: ['#EBBC16 6.25%', '#DB535B'],
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
]


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
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  margin-bottom: 32px;
  margin-top: -100px;
  overflow: hidden;
  position: relative;
  z-index: 10;
`

const Container = styled.div`
  overflow: hidden;
  width: calc(100% - 8px);
`


export const Preview = () => (
  <div>
    <TopNav label="1 of 2" />
    <TicketHeader ticket={defaultTicket} fullWidth/>
    <PullUp>
      <Container>
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
          wSeparator
        />
        <SponsorsCard
          sponsors={sponsorsList}
          title='Sponsors'
          wSeparator
        />
        <TitleText title="2x beers" text="Quisque at risus molestie, interdum lectus sed, ultrices quam."/>
      </Container>
      <Gradient values={defaultTicket.gradients} />
    </PullUp>
    <div className="container">
      <LinkButton label="View previous transactions" to="#todo" />
    </div>
    <div className="container">
      <QrCodeButton label="Tap to scan your QR code" />
    </div>
  </div>
);
