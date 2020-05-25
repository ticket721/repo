import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { select, text, withKnobs } from '@storybook/addon-knobs';
import { Notification } from '../../src/components/notification';

export default {
  title: 'Global|Notification',
  decorators: [
    withKnobs
  ],
  component: Notification
};

export const showcase = () => (
  <Notification
    message={text('Notification message', 'This is a notification')}
    onCloseClick={action('closed')}
    kind={select('Kind', {
      Info: 'info',
      Success: 'success',
      Error: 'error',
      Warning: 'warning'
    }, 'info')}
  >
  </Notification>
);

export const types = () => (
  <div>
    <Notification
      message={'Info Notification'}
      onCloseClick={action('closed')}
      kind='info'
    />
    <Notification
      message={'Success Notification'}
      onCloseClick={action('closed')}
      kind='success'
    />
    <Notification
      message={'Error Notification'}
      onCloseClick={action('closed')}
      kind='error'
    />
    <Notification
      message={'Warning Notification'}
      onCloseClick={action('closed')}
      kind='warning'
    />
  </div>
);
