import * as React from 'react';
import { withKnobs, text } from '@storybook/addon-knobs';
import DateTimeCard from '../../src/components/ticket/cards/datetime';

export default {
    title: 'Cards|Datetime',
    decorators: [withKnobs],
    parameters: {
        viewport: { defaultViewport: 'iphone6' },
    },
};

export const DateTimeOnly = () => (
    <DateTimeCard
        dates={[
            {
                startDate: text('Start date', '2020/02/14'),
                endDate: text('End date', '2020/02/15'),
                startTime: text('Start time', '2:00PM'),
                endTime: text('End time', '4:00PM'),
            },
        ]}
        iconColor={text('Icon color: ', '#EBBC16')}
    />
);
