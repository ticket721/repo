import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { text, withKnobs } from '@storybook/addon-knobs';
import Toggle from '../src/components//inputs/toggle';

const onChange = action('change');

export default {
  title: 'Toggle',
  component: Toggle,
  decorator: {
    withKnobs
  }
};

export const showcase = () => (
  <Toggle
    label={text('Label', 'Recurring event')}
    name={text('Input name', 'checkbox')}
    description={text('Description', 'Don’t worry, you will be able to edit manually each events’ dates, locations and start time')}
    onChange={onChange}
  />
);
