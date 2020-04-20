import * as React from 'react';
import TimePicker from '../../src/components/time-picker'
import { text, withKnobs } from '@storybook/addon-knobs';
import { Store, State} from '@sambego/storybook-state';

export default {
  component: TimePicker,
  decorators: [
    withKnobs
  ],
  title: 'Global|TimePicker'
}

interface StoreObject {
  selectedTime: Date | undefined;
}

let storeObject: StoreObject = {
  selectedTime: undefined
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
