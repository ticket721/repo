import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { boolean, text, withKnobs } from '@storybook/addon-knobs';
import Textarea from '../src/components/inputs/textarea';

export default {
  title: 'Textarea',
  decorators: [
    withKnobs
  ],
  component: Textarea
};

export const Text = () => (
  <Textarea
    error={boolean('Error', false)}
    errorMessage={text('Error message', 'Error')}
    label={text('Label', 'Label')}
    name={text('Input name', 'example')}
    onChange={action('typing...')}
    placeholder={text('Placeholder', 'placeholder')}
    value={text('Value', '')}
    maxChar={40}
  />
);

