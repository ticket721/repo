import * as React from 'react';
import { withKnobs } from '@storybook/addon-knobs';
import { Loader } from '../../src/components/loader';

export default {
  title: 'Global|Loader',
  decorators: [withKnobs],
  component: Loader,
};

export const AnimatedLoader = () => (
  <Loader
      color={'#FFF'}
      size={'50px'}
  />
);
