import * as React from 'react';
import TimePicker from '../src/components/time-picker'
import { text, withKnobs } from '@storybook/addon-knobs';
import { Store, State} from "@sambego/storybook-state";
import { roundToNearestMinutes } from 'date-fns';

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
  selectedTime: roundToNearestMinutes(new Date(), {nearestTo: 30})
};

const store = new Store(storeObject);

const onChange = (date: Date) => {
  store.set({
    selectedTime: date
  })
};

//optionnal: used to prevent manual input
const onChangeRaw = (e: React.FocusEvent<HTMLInputElement>) => {
  e.preventDefault();
}

export const showcase = () => (
  <State store={store}>
    {state => [
      <TimePicker
        dateFormat={text('Time format', 'h:mm aa')}
        label={text('Label', 'Start time')}
        onChange={onChange}
        onChangeRaw={onChangeRaw}
        placeholderText={text('Placeholder', 'Pick start time')}
        selected={state.selectedTime}
      />
    ]}
  </State>
);
