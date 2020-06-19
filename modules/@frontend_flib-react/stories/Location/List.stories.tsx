import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { text, withKnobs } from '@storybook/addon-knobs';
import LocationList from '../../src/components/location/list';

export default {
    title: 'Location|List',
    decorators: [withKnobs],
    parameters: {
        viewport: { defaultViewport: 'iphone6' },
    },
};

const locations = [
    {
        label: 'Quebec City, CA',
        value: 'QC',
    },
    {
        label: 'San Diego, USA',
        value: 'QC',
    },
];

export const showcase = () => (
    <LocationList
        title={text('Title', 'Popular locations')}
        locations={locations}
        updateLocation={action('...updating location')}
    />
);
