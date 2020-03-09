import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { boolean, text, withKnobs } from '@storybook/addon-knobs';
import TextInput from '../src/components/textInput';

export default {
  title: 'TextInput',
  decorators: [
    withKnobs
  ],
  component: TextInput
};

export const showcase = () => (
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

