import * as React from 'react';
import DatePicker from '../src/components/date-picker'
import { action } from "@storybook/addon-actions";

const onChange = action('change');

export default {
  component: DatePicker,
  title: 'DatePicker'
}

export const singleDate = () => (
  <DatePicker onChange={onChange}/>
);
