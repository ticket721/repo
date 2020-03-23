import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { text, withKnobs } from '@storybook/addon-knobs';
import Radio from '../src/components/inputs/radio';

const onChange = action('change');

export default {
  title: 'Radio button',
  decorators: [
    withKnobs
  ],
  component: Radio
};

export const showcase = () => (
  <div>
    <Radio
      label={text('Label', 'Radio 1 label')}
      name={text('Input name', 'radio')}
      onChange={onChange}
      value="radio-1"
    />
    <Radio
      label={text('Label - Radio 2', 'Radio 2 label')}
      name={text('Input name', 'radio')}
      onChange={onChange}
      value="radio-2"
    />
  </div>
);
