import * as React from 'react';
import DatePicker from '../../src/components/date-picker'
import { text, withKnobs, select } from '@storybook/addon-knobs';
import { Store, State} from '@sambego/storybook-state';

export default {
  component: DatePicker,
  decorators: [
    withKnobs
  ],
  title: 'Global|DatePicker'
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

//optionnal: used to prevent manual input
const onChangeRaw = (e: React.FocusEvent<HTMLInputElement>) => {
  e.preventDefault();
}

const locales = {
  None: '',
  French: 'fr',
  Spanish: 'es',
  Italian: 'it',
};

export const singleDate = () => (
  <State store={store}>
    {state => [
      <DatePicker
        dateFormat={text('date format', 'iii, MMM do, yyyy')}
        label={text('Label', 'Start date')}
        locale={select('Select locale', locales, '')}
        onChange={onChange}
        onChangeRaw={onChangeRaw}
        placeholderText={text('Placeholder', 'Pick a date')}
        selected={state.selectedDate}
      />
    ]}
  </State>
);
