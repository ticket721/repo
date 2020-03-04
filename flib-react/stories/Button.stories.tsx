import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { select, text, withKnobs } from '@storybook/addon-knobs';
import { Button } from '../src/button';

export default {
  title: 'Button',
  decorators: [
    withKnobs
  ],
  component: Button,
  parameters: {
    viewport: {
      defaultViewport: 'iphonex'
    }
  }
};

export const showcase = () => (
  <Button
    title={text('Button Title', 'Click on me !')}
    onClick={action('clicked')}
    type={select('Type', {
      Primary: 'primary',
      Secondary: 'secondary',
      Custom: 'custom'
    }, 'primary')}
    gradientStart='#DB535B'
    gradientEnd='#EBBC16'
  >
  </Button>
);
