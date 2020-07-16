import * as React from 'react';
import { withKnobs, text } from '@storybook/addon-knobs';
import PurchaseTotal from '../../src/components/ticket/total';

export default {
    title: 'Ticket|Purchase total',
    decorators: [withKnobs],
    parameters: {
        viewport: { defaultViewport: 'iphone6' },
    },
};

export const showcase = () => (
    <PurchaseTotal
        totalLabel={text('Total', 'Total')}
        subtotalLabel={text('Subtotal', 'Subtotal')}
        label={text('Review Order', 'Review Order')}
        total={[
            {
                name: 'Tickets',
                price: 100,
            },
        ]}
        fees={[
            {
                name: 'Tickets',
                price: 100,
            },
        ]}
    />
);
