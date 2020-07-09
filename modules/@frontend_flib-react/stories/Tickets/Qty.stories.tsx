import * as React from 'react';
import { withKnobs, text, number, boolean, array } from '@storybook/addon-knobs';
import TicketQty from '../../src/components/ticket/ticket-qty';
import { action } from '@storybook/addon-actions';

export default {
    title: 'Ticket|Select quantity',
    decorators: [withKnobs],
    parameters: {
        viewport: { defaultViewport: 'iphone6' },
    },
};

const gradientsValues = ['#22c1c3', '#68bf93', '#8cbe7b', '#bdbd59', '#fdbb2d'];

export const showcase = () => (
    <TicketQty
        color={text('Color', '#DB535B')}
        fees={'55 euro'}
        options={[
            {
                label: '1',
                value: 1,
            },
        ]}
        initialOption={{
            label: '1',
            value: 1,
        }}
        gradient={array('Gradient', gradientsValues)}
        onChange={action('onChange')}
        selected={boolean('Selected ?', false)}
        price={text('Starting price', '55€')}
        typeName={text('Ticket type', '2 days VIP pass')}
        ticketsLeft={number('Tickets left', 10)}
        title={text('Title', 'Tickets')}
    />
);
