import * as React from 'react';
import { withKnobs, text } from '@storybook/addon-knobs';
import { Description } from '../../src/components/cards/description';

export default {
    title: 'Cards|Description',
    decorators: [withKnobs],
    parameters: {
        viewport: { defaultViewport: 'iphone6' },
    },
};

export const showcase = () => (
    <Description
        color={text('Color', '#D19F02')}
        title={text('Title:', 'About')}
        text={text(
            'Description',
            'Duis posuere dui ut arcu dictum pellentesque. Nunc ex nulla, dictum sed risus eget, tempus pretium ex. Mauris ornare tempor blandit. Cras et mollis quam, sit amet porttitor odio. Duis posuere dui ut arcu dictum pellentesque. Nunc ex nulla, dictum sed risus eget, tempus pretium ex. Mauris ornare tempor blandit. Cras et mollis quam, sit amet porttitor odio.',
        )}
    />
);
