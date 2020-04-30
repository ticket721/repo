import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { select, text, array, withKnobs } from '@storybook/addon-knobs';
import { Button } from '../../src/components/button';

const gradientsValues = ['#22c1c3', '#68bf93', '#8cbe7b', '#bdbd59', '#fdbb2d'];

export default {
  title: 'Global|Button',
  decorators: [
    withKnobs
  ],
  component: Button
};

export const showcase = () => (
  <Button
    title={text('Button Title', 'Click on me !')}
    onClick={action('clicked')}
    variant={select('Variant', {
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
      variant={'primary'}
    >
    </Button>
    <Button
      title={'Secondary Button'}
      onClick={action('clicked')}
      variant={'secondary'}
    >
    </Button>
    <Button
      title={'Warning Button'}
      onClick={action('clicked')}
      variant={'warning'}
    >
    </Button>
    <Button
      title={'Custom Button'}
      onClick={action('clicked')}
      variant={'custom'}
      gradients={array('Custom Gradient', gradientsValues)}
    >
    </Button>
  </div>
);
