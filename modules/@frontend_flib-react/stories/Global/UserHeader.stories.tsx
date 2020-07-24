import * as React from 'react';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import UserHeader from '../../src/components/elements/user-header';

export default {
    title: 'Global | User Header',
    decorators: [withKnobs],
    parameters: {
        viewport: { defaultViewport: 'iphone6' },
    },
};

export const showcase = () => (
    <UserHeader
        username={'mortimr'}
        picture={'assets/images/user-1.jpg'}
        profileHeader={boolean('Profile header ?', false)}
        tickets={'12'}
    />
);
