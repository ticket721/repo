import * as React from 'react';
import DatePicker from '../src/components/date-picker'
import { text, withKnobs } from '@storybook/addon-knobs';
import { Store, State} from "@sambego/storybook-state";

export default {
  component: DatePicker,
  decorators: [
    withKnobs
  ],
  title: 'DatePicker'
}

interface StoreObject {
  selectedDate: Date | undefined;
}

let storeObject: StoreObject = {
  selectedDate: undefined
};

const store = new Store(storeObject);


const onChange = (date: Date) => {
  store.set({
    selectedDate: date
  })
};


export const singleDate = () => (
  <State store={store}>
    {state => [
      <DatePicker
        dateFormat={text('date format', 'iii, MMM do, yyyy')}
        label={text('Label', 'Start date')}
        onChange={onChange}
        placeholderText={text('Placeholder', 'Pick a date')}
        selected={state.selectedDate}
      />
    ]}
  </State>
);
