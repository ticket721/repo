import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { text, withKnobs } from '@storybook/addon-knobs';
import Checkbox from '../../src/components/inputs/checkbox';

const onChange = action('change');

export default {
  title: 'Global|Checkbox',
  component: Checkbox,
  decorator: [
    withKnobs
  ]
};

export const showcase = () => (
  <Checkbox
    label={text('Label', 'Checkbox label')}
    name={text('Input name', 'checkbox')}
    onChange={onChange}
  />
);
