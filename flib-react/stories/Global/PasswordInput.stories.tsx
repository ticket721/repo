import * as React          from 'react';
import { action }          from '@storybook/addon-actions';
import { text, withKnobs } from '@storybook/addon-knobs';
import { PasswordInput }   from '../../src/components/inputs/password';

export default {
  title: 'Global|Password input',
  decorators: [
    withKnobs
  ],
  component: PasswordInput
};

export const Password = () => (
  <PasswordInput
    error={text('Error message', 'Error')}
    label={text('Label', 'Label')}
    name={text('Input name', 'example')}
    onChange={action('typing...')}
    placeholder={text('Placeholder', 'placeholder')}
    value={text('Value', '')}
  />
);

