import * as React from 'react';
import { withKnobs, text } from '@storybook/addon-knobs';
import LinkButton from '../../src/components/ticket/link-button';


export default {
  title: 'Ticket|LinkButton',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

export const SimpleLink = () => (
  <div className="row jcc">
    <LinkButton
      label={text('Label', 'View transactions history')}
      to="#todo"
    />
  </div>
);

export const SimpleLinkWithImage = () => (
  <div className="row jcc">
    <LinkButton
      image="assets/images/spotify--logo.svg"
      label={text('Label', 'Listen on spotify')}
      to="#todo"
    />
  </div>
);
