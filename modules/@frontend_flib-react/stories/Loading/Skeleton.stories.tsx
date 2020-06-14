import { boolean, withKnobs } from '@storybook/addon-knobs';
import * as React from 'react';
import Skeleton from '../../src/components/loading/skeleton';

export default {
    title: 'Loading|Skeletons',
    decorators: [withKnobs],
    parameters: {
        viewport: { defaultViewport: 'iphone6' },
    },
};

export const showcase = () => (
    <div style={{ padding: 24 }}>
        <Skeleton type={'textRow'} ready={boolean('Ready', false)} showLoadingAnimation={true}>
            <p>MyComponent</p>
        </Skeleton>
    </div>
);
