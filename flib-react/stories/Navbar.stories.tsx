import * as React from 'react';
import { withKnobs } from '@storybook/addon-knobs';
import Navbar from '../src/components/navbar';
import Icon from '../src/components/icon';
import { MemoryRouter, NavLink } from 'react-router-dom';

export default {
  title: 'Navbar',
  decorators: [
    withKnobs
  ],
  component: Navbar
};

export const showcase = () => (
  <MemoryRouter>
    <Navbar>
      <NavLink to="/home">
        <Icon icon="home" fill="#fff" />
      </NavLink>
      <NavLink to="/search">
        <Icon icon="search" fill="#fff" />
      </NavLink>
      <NavLink to="/">
        <Icon icon="t721" height="20" width="49" fill="#fff" />
      </NavLink>
      <NavLink to="/tags">
        <Icon icon="tag" fill="#fff"/>
      </NavLink>
      <NavLink to="/profile">
        <Icon icon="profile" fill="#fff" />
      </NavLink>
    </Navbar>
  </MemoryRouter>
);
