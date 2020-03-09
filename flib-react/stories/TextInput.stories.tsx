import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { boolean, text, withKnobs } from '@storybook/addon-knobs';
import TextInput from '../src/components/inputs/text';

export default {
  title: 'Text input',
  decorators: [
    withKnobs
  ],
  component: TextInput
};

export const Text = () => (
  <TextInput
    error={boolean('Error', false)}
    errorMessage={text('Error message', 'Error')}
    label={text('Label', 'Label')}
    name={text('Input name', 'example')}
    onChange={action('typing...')}
    placeholder={text('Placeholder', 'placeholder')}
    value={text('Value', '')}
  />
);

