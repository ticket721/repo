import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { text, withKnobs, array } from '@storybook/addon-knobs';
import { Store, State } from '@sambego/storybook-state';

import LocationList from '../../src/components/location/list';
import CurrentLocation from '../../src/components/location/current';
import SearchInput from '../../src/components/search/input';


export default {
  title: 'Location|Change',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

const updateLocation = (location: string) => {
  store.set({
    currentLocation: location
  })
};

const locations = ['Quebec City, CA', 'San Diego, USA', 'Paris, FR']


const store = new Store({
  currentLocation: ''
});

export const showcase = () => (
  <State store={store}>
    {state => [
    <div key="1">
      <SearchInput
        clearInput={action('clear')}
        name="input--search"
        onChange={action('typing...')}
        placeholder="Search city"
        cancelLabel="Cancel"
        cancel={action('cancel')}
        icon="pin"
      />
      <CurrentLocation
        label={text('Use current location label', 'Use current my location')}
        getCurrentLocation={action('...fetch location')}
      />
      <LocationList
        title="Current location"
        locations={['Quebec City']}
        selectedLocation={'Quebec City'}
        updateLocation={updateLocation}
      />
      <LocationList
        title={text('Title', 'Popular locations')}
        locations={array('Locations', locations)}
        updateLocation={updateLocation}
        selectedLocation={state.currentLocation}
      />
    </div>
    ]}
  </State>
)
