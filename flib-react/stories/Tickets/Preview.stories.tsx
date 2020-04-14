import * as React from 'react';
import { withKnobs } from '@storybook/addon-knobs';
import styled from '../../config/styled';
import TicketHeader from '../../src/components/ticket/header';
import TicketPreview from '../../src/components/ticket/infos';

const defaultTicket = {
  name: 'Ticket #1',
  location: 'Philharmonie de Paris',
  address: '221 avenue Jean Jaurès, Paris',
  number: 12,
  ticketType: '2 Days pass',
  startDate: '2020/02/14',
  endDate: '2020/20/15',
  startTime: '2:00PM',
  ticketId: '00251501AS-D04546SD',
  endTime: '4:00PM',
  gradients: ['#EBBC16 6.25%', '#DB535B'],
  mainColor: '#EBBC16',
  addOns: 2,
  image: '/assets/images/ticket-1.jpg'
}

export default {
  title: 'Ticket|Preview',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

const PullUp = styled.div`
  margin-top: -94px;
  position: relative;
  z-index: 1;
`

const Container = styled.div`
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  margin: 1rem;
  overflow: hidden;
`

export const showcase = () => (
  <div>
    <Container>
      <div className="row jcsb aife">
        <h1>My tickets</h1>
        <a href="#todo">View past ticket</a>
      </div>
      <TicketHeader ticket={defaultTicket} />
      <PullUp>
        <TicketPreview ticket={defaultTicket} />
      </PullUp>
    </Container>
  </div>
)
