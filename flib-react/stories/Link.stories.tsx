import * as React from 'react';
import { text, withKnobs } from '@storybook/addon-knobs';
import { Link } from '../src/components/link';

export default {
  title: 'Link',
  decorators: [
    withKnobs
  ],
  component: Link
};

export const showcase = () => (
  <Link label={text('Label', 'Click on me !')} to={text('Link', 'http://google.ca')}></Link>
);
