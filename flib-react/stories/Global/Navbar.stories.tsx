import * as React from 'react';
import { withKnobs } from '@storybook/addon-knobs';
import Navbar from '../../src/components/navbar';
import Icon from '../../src/components/icon';
import { MemoryRouter, NavLink } from 'react-router-dom';

export default {
  title: 'Global|Navbar',
  decorators: [
    withKnobs
  ],
  component: Navbar
};

export const showcase = () => (
  <MemoryRouter>
    <Navbar>
      <NavLink to='/home'>
        <Icon icon='home' size='24px' color='#fff' />
      </NavLink>
      <NavLink to='/search'>
        <Icon icon='search' size='22px' color='#fff' />
      </NavLink>
      <NavLink to='/'>
        <Icon icon='t721' size='22px' color='#fff' />
      </NavLink>
      <NavLink to='/tags'>
        <Icon icon='tag' size='22px' color='#fff' />
      </NavLink>
      <NavLink to='/profile'>
        <Icon icon='profile' size='22px' color='#fff' />
      </NavLink>
    </Navbar>
  </MemoryRouter>
);
