import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { text, withKnobs } from '@storybook/addon-knobs';
import TextInput from '../../src/components/inputs/text';

export default {
  title: 'Global|Text input',
  decorators: [
    withKnobs
  ],
  component: TextInput
};

export const Text = () => (
  <TextInput
    error={text('Error message', 'Error')}
    label={text('Label', 'Label')}
    name={text('Input name', 'example')}
    onChange={action('typing...')}
    placeholder={text('Placeholder', 'placeholder')}
    value={text('Value', '')}
  />
);

