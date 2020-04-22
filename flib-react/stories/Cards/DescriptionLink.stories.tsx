import * as React from 'react';
import { withKnobs, text } from '@storybook/addon-knobs';
import DescriptionLinkCard from '../../src/components/cards/description-link';

export default {
  title: 'Cards|Description and link',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

export const showcase = () => (
  <DescriptionLinkCard
    link="#todo"
    title={text('Title:', '10 days before event')}
    subtitle={text('Subtitle', 'Refund policy' )}
    text={text('Description', 'Duis posuere dui ut arcu dictum pellentesque.')}
  />
);
