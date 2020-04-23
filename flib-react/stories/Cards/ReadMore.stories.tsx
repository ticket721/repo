import * as React from 'react';
import { withKnobs, text } from '@storybook/addon-knobs';
import ReadMoreCard from '../../src/components/cards/read-more';

export default {
  title: 'Cards|Read More',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

export const showcase = () => (
  <ReadMoreCard
    readMoreColor={text('Color', '#D19F02')}
    title={text('Title:', 'About')}
    showLabel={text('Read more', 'Read more')}
    hideLabel={text('Show less', 'Show less')}
    text={text('Description', 'Duis posuere dui ut arcu dictum pellentesque. Nunc ex nulla, dictum sed risus eget, tempus pretium ex. Mauris ornare tempor blandit. Cras et mollis quam, sit amet porttitor odio. Duis posuere dui ut arcu dictum pellentesque. Nunc ex nulla, dictum sed risus eget, tempus pretium ex. Mauris ornare tempor blandit. Cras et mollis quam, sit amet porttitor odio.')}
  />
);
