import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { text, withKnobs } from '@storybook/addon-knobs';
import { Store, State } from '@sambego/storybook-state';

import LocationList from '../../src/components/location/list';
import CurrentLocation from '../../src/components/location/current';
import SearchInput from '../../src/components/search/input';

export default {
    title: 'Location|Change',
    decorators: [withKnobs],
    parameters: {
        viewport: { defaultViewport: 'iphone6' },
    },
};

const updateLocation = (location: string) => {
    store.set({
        currentLocation: location,
    });
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

const store = new Store({
    currentLocation: '',
});

export const showcase = () => (
    <State store={store}>
        {(state) => [
            <div key={'1'}>
                <SearchInput
                    clearInput={action('clear')}
                    name={'input--search'}
                    onChange={action('typing...')}
                    placeholder={'Search city'}
                    cancelLabel={'Cancel'}
                    cancel={action('cancel')}
                    icon={'pin'}
                />
                <CurrentLocation
                    label={text('Use current location label', 'Use current my location')}
                    getCurrentLocation={action('...fetch location')}
                />
                <LocationList
                    title={'Current location'}
                    locations={[{ label: 'Quebec City', value: 'QC' }]}
                    selectedLocation={'Quebec City'}
                    updateLocation={updateLocation}
                />
                <LocationList
                    title={text('Title', 'Popular locations')}
                    locations={locations}
                    updateLocation={updateLocation}
                    selectedLocation={state.currentLocation}
                />
            </div>,
        ]}
    </State>
);
