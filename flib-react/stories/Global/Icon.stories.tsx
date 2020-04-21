import * as React from 'react';
import { color, select, withKnobs } from '@storybook/addon-knobs';
import Icon      from '../../src/components/icon';
import { icons } from '../../src/shared';
import styled    from '../../src/config/styled';

export default {
  component: Icon,
  decorators: [
    withKnobs
  ],
  title: 'Global|Icon'
};

const Item = styled.li`
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: 1rem;
  text-align: center;

  span {
    color: #fff;
    display: block;
    font-size: 12px;
    font-weight: 500;
    margin-top: 0.75rem;
    text-transform: capitalize;
    width: 100%;
  }
`;


const List = styled.ul`
  display: flex;
  flex-flow: row wrap;
  list-style: none;
`;

export const showcase = () => (
  <Icon
    icon={select('Icon name', {
      T721: 't721',
      Arrow: 'arrow',
      Chevron: 'chevron',
      Home: 'home',
      Profile: 'profile',
      Tag: 'tag',
      Search: 'search'
    }, 't721')}
    width="50"
    height="20"
    fill={color('Icon color', '#fff')}
  />
);

export const list = () => (
  <List>
    { Object.keys(icons).map(key => (
      <Item key={key}>
        {key === 't721' ?
          <Icon icon={key} aria-label={key} height="20" width="49" /> : <Icon icon={key} aria-label={key} />}
          <span>{ key }</span>
      </Item>
    ))}
  </List>
);
