import * as React from 'react';
import DatePicker from '../src/components/date-picker'
import { text, withKnobs } from '@storybook/addon-knobs';

import { action } from "@storybook/addon-actions";

const onChange = action('change');
const currentDate:Date = new Date();

export default {
  component: DatePicker,
  decorators: [
    withKnobs
  ],
  title: 'DatePicker'
}

export const singleDate = () => (
  <DatePicker
    label={text('Label', 'Start date')}
    onChange={onChange}
    placeholderText={text('Placeholder', 'Pick a date')}
    selected={currentDate}
  />
);
