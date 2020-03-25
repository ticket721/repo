import * as React from 'react';
import TimePicker from '../src/components/time-picker'
import { text, withKnobs } from '@storybook/addon-knobs';
import { Store, State} from "@sambego/storybook-state";

export default {
  component: TimePicker,
  decorators: [
    withKnobs
  ],
  title: 'TimePicker'
}

interface StoreObject {
  selectedTime: Date;
}

let storeObject: StoreObject = {
  selectedTime: new Date()
};

const store = new Store(storeObject);

const onChange = (date: Date) => {
  console.log(store.get('selectedTime'));
  store.set({
    selectedTime: date
  })
};


export const showcase = () => (
  <State store={store}>
    {state => [
      <TimePicker
        dateFormat={text('Time format', 'h:mm aa')}
        label={text('Label', 'Start time')}
        onChange={onChange}
        selected={state.selectedTime}
      />
    ]}
  </State>
);
