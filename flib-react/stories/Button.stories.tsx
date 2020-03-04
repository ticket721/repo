import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { select, text, array, withKnobs } from '@storybook/addon-knobs';
import { Button } from '../src/button';

const gradientsValues = ['#22c1c3', '#68bf93', '#8cbe7b', '#bdbd59', '#fdbb2d'];

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
      Custom: 'custom',
      Warning: 'warning'
    }, 'primary')}
    gradients={array('Update to change color of custom button', gradientsValues)}
  >
  </Button>
);

export const types = () => (
  <div>
    <Button
      title={'Primary Button'}
      onClick={action('clicked')}
      type={'primary'}
    >
    </Button>
    <Button
      title={'Secondary Button'}
      onClick={action('clicked')}
      type={'secondary'}
    >
    </Button>
    <Button
      title={'Warning Button'}
      onClick={action('clicked')}
      type={'warning'}
    >
    </Button>
    <Button
      title={'Custom Button'}
      onClick={action('clicked')}
      type={'custom'}
      gradients={array('Custom Gradient', gradientsValues)}
    >
    </Button>
  </div>
);
