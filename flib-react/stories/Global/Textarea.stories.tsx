import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { number, text, withKnobs } from '@storybook/addon-knobs';
import Textarea from '../../src/components/inputs/textarea';

export default {
  title: 'Global|Textarea',
  decorators: [
    withKnobs
  ],
  component: Textarea
};

export const Text = () => (
  <Textarea
    error={text('Error message', 'Error')}
    label={text('Label', 'Label')}
    name={text('Input name', 'example')}
    onChange={action('typing...')}
    placeholder={text('Placeholder', 'Placeholder')}
    value={text('Value', '')}
    maxChar={number('Max character', 250)}
  />
);

