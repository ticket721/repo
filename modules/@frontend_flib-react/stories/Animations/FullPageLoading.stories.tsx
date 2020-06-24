import * as React from 'react';
import { withKnobs } from '@storybook/addon-knobs';
import FullPageLoading from '../../src/components/animation/fullpageloading';

export default {
    title: 'Animation | FullPageLoading',
    decorators: [withKnobs],
    parameters: {
        viewport: { defaultViewport: 'iphone6' },
    },
};

export const showcase = () => <FullPageLoading height={500} width={500} />;
