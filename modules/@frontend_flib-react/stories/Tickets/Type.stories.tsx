import * as React from 'react';
import { withKnobs, text, number, boolean, array, date } from '@storybook/addon-knobs';
import TicketType from '../../src/components/ticket/type';

export default {
    title: 'Ticket|Type',
    decorators: [withKnobs],
    parameters: {
        viewport: { defaultViewport: 'iphone6' },
    },
};

const gradientsValues = ['#22c1c3', '#68bf93', '#8cbe7b', '#bdbd59', '#fdbb2d'];

export const showcase = () => (
    <TicketType
        color={text('Color', '#DB535B')}
        gradient={array('Gradient', gradientsValues)}
        dates={[{
          name: 'Event',
          start: new Date(),
          online: false
        }]}
        feesIncluded={boolean('Fees included ?', false)}
        selected={boolean('Selected ?', false)}
        soldOutLabel={text('Sold out', 'Sold out')}
        price={text('Price', '55€')}
        startingPriceLabel={text('Starting at', 'Starting at')}
        title={text('Ticket type', '2 days VIP pass')}
        ticketsLeft={number('Tickets left', 10)}
        ticketsLeftLabel={text('Tickets left', 'left')}
        availableInLabel={text('Available in', 'Available in')}
        saleEndsInLabel={text('Sale ends in', 'Sale ends in')}
        saleBegin={new Date(date('Sale begin', new Date(Date.now() - 1)))}
        saleEnd={new Date(date('Sale End', new Date(Date.now() + 100000)))}
    />
);
