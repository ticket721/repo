import * as React from 'react';
import { withKnobs, text } from '@storybook/addon-knobs';
import DateTimeCard from '../../src/components/ticket/cards/datetime';

export default {
  title: 'Cards|Datetime',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

export const DateTimeOnly = () => (
  <DateTimeCard
    endDate={text('End date', '2020/02/15')}
    endTime={text('End time', '4:00PM')}
    iconColor={text('Icon color: ', '#EBBC16')}
    startDate={text('Start date', '2020/02/14')}
    startTime={text('Start time', '2:00PM')}
  />
);

export const DateTimeWithLink = () => (
  <DateTimeCard
    endDate={text('End date', '2020/02/15')}
    endTime={text('End time', '4:00PM')}
    iconColor={text('Icon color: ', '#EBBC16')}
    startDate={text('Start date', '2020/02/14')}
    startTime={text('Start time', '2:00PM')}
    link="linkto"
    linkLabel={text('Link label', 'Get more informations')}
  />
);

