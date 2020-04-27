import * as React from 'react';
import { withKnobs, text } from '@storybook/addon-knobs';
import TitleTextCard from '../../src/components/ticket/cards/title-text';

export default {
  title: 'Cards|Title and text',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

export const showcase = () => (
  <TitleTextCard
    title={text('Title', 'About')}
    text={text('Description', 'Duis posuere dui ut arcu dictum pellentesque. Nunc ex nulla, dictum sed risus eget, tempus pretium ex. Mauris ornare tempor blandit. Cras et mollis quam, sit amet porttitor odio. Duis posuere dui ut arcu dictum pellentesque. Nunc ex nulla, dictum sed risus eget, tempus pretium ex. Mauris ornare tempor blandit. Cras et mollis quam, sit amet porttitor odio.')}
  />
);
