import * as React from 'react';
import { boolean, object, text, withKnobs } from '@storybook/addon-knobs';
import SelectInput from '../src/components/inputs/select';

const selectValues = [
  { value: 'music', label: 'Music' },
  { value: 'festival', label: 'Festival' },
  { value: 'conference', label: 'Conference' }
]

export default {
  title: 'Select input',
  decorators: [
    withKnobs
  ],
  component: SelectInput
};

export const Select = () => (
  <SelectInput
    label={text('Label', 'Category')}
    placeholder={text('Placeholder', 'Select category')}
    options={object('Values', selectValues)}
    searchable={boolean('Search as you type ?', false)}
  />
);

