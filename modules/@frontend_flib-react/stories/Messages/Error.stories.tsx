import * as React from 'react';
import { withKnobs } from '@storybook/addon-knobs';
import Error from '../../src/components/message/Error';

export default {
    title: 'Messages | Error',
    decorators: [withKnobs],
    parameters: {
        viewport: { defaultViewport: 'iphone6' },
    },
};

export const showcase = () => <Error message={'An Error Occured'} />;
