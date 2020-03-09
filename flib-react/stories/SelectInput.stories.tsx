import * as React from 'react';
// import { action } from '@storybook/addon-actions';
import { withKnobs } from '@storybook/addon-knobs';
import SelectInput from '../src/components/inputs/select';

export default {
  title: 'Select input',
  decorators: [
    withKnobs
  ],
  component: SelectInput
};

export const Select = () => (
  <SelectInput />
);

