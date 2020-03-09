import * as React from 'react';
import { withKnobs } from '@storybook/addon-knobs';
import Navbar from '../src/components/navbar';
import Link from '../src/components/link';
import Icon from '../src/components/icon';

export default {
  title: 'Navbar',
  decorators: [
    withKnobs
  ],
  component: Navbar
};

export const showcase = () => (
  <Navbar>
    <Link to="/">
      <Icon icon="home" fill="#fff" />
    </Link>
    <Link to="/">
      <Icon icon="search" fill="#fff" />
    </Link>
    <Link to="/" isActive>
      <Icon icon="t721" height="20" width="49" fill="#fff" />
    </Link>
    <Link to="/">
      <Icon icon="tag" fill="#fff"/>
    </Link>

    <Link to="/">
      <Icon icon="profile" fill="#fff" />
    </Link>
  </Navbar>
);
