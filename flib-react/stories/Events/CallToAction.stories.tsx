import * as React from 'react';
import { withKnobs, text, boolean, array } from '@storybook/addon-knobs';
import EventCta from '../../src/components/events/cta';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Events|Call-to-action',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

const gradientValues = ['#079CF0','#2143AB'];

export const showcase = () => (
  <EventCta
    gradients={array('Gradient colors', gradientValues)}
    onClick={action('clicked')}
    subtitle={text('Price range', '33€ to 100€ each')}
    title={text('Title', 'Tickets from')}
    ctaLabel={text('Button label', 'Get tickets')}
    show={boolean('Show ?', true)}
  />
);
