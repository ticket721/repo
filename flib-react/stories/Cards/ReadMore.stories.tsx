import * as React from 'react';
import { withKnobs, text } from '@storybook/addon-knobs';
import ReadMoreCard from '../../src/components/cards/read-more';
import { State, Store } from '@sambego/storybook-state';

export default {
  title: 'Cards|Read More',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

const toggleText = () => {
  store.set({
    label: store.get('showText') ? 'Read more': 'Read less',
    showText: !store.get('showText')
  })
}

const store = new Store({
  label: 'Read more',
  showText: false
})

export const showcase = () => (
  <State store={store}>
    {state => [
      <ReadMoreCard
        showText={state.showText}
        toggleText={toggleText}
        readMoreColor={text('Color', '#D19F02')}
        title={text('Title:', 'About')}
        text={text('Description', 'Duis posuere dui ut arcu dictum pellentesque. Nunc ex nulla, dictum sed risus eget, tempus pretium ex. Mauris ornare tempor blandit. Cras et mollis quam, sit amet porttitor odio. Duis posuere dui ut arcu dictum pellentesque. Nunc ex nulla, dictum sed risus eget, tempus pretium ex. Mauris ornare tempor blandit. Cras et mollis quam, sit amet porttitor odio.')}
        readMoreLabel={state.label}
      />
    ]}
  </State>
);
