import * as React from 'react';
import { withKnobs, text } from '@storybook/addon-knobs';
import LocationCard from '../../src/components/ticket/cards/location';

export default {
    title: 'Cards|Location',
    decorators: [withKnobs],
    parameters: {
        viewport: { defaultViewport: 'iphone6' },
    },
};

export const LocationOnly = () => (
    <LocationCard
        location={text('Location: ', 'Philharmonie de Paris')}
        subtitle={text('Subtitle', 'Get directions')}
        address={text('Address:', '221 avenue Jean Jaurès, Paris')}
        iconColor={text('Color:', '#EBBC16')}
    />
);

export const WithLink = () => (
    <LocationCard
        location={text('Location: ', 'Philharmonie de Paris')}
        subtitle={text('Subtitle', 'Get directions')}
        iconColor={text('Color:', '#EBBC16')}
        linkLabel={text('Direction label', 'Get directions')}
    />
);
