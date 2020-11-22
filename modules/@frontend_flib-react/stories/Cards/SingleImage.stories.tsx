import * as React from 'react';
import { withKnobs, text, boolean } from '@storybook/addon-knobs';
import SingleImage from '../../src/components/events/single-image';

export default {
    title: 'Cards|Single image',
    decorators: [withKnobs],
    parameters: {
        viewport: { defaultViewport: 'iphone6' },
    },
};

export const ImageOnly = () => <SingleImage id={1} cover={text('URL', 'assets/images/ticket-1.jpg')} imgOnly />;

export const WithDetails = () => (
    <SingleImage
        cover={text('URL', 'assets/images/ticket-1.jpg')}
        id={1}
        price={text('Price', '55')}
        mainColor={text('Color', '#E4863C')}
        text={text('short description', 'January 8th 2021')}
        smaller={boolean('Smaller ?', false)}
        title={text('Title', 'Gallant')}
    />
);
