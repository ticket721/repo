import * as React from 'react';
import { withKnobs } from '@storybook/addon-knobs';
import Icon from '../src/components/icon';
import { icons } from '../src/shared/icons';
import styled from '../config/styled';

export default {
  title: 'Icon',
  decorators: [
    withKnobs
  ],
  component: Icon
};

const Item = styled.li`
  align-items: center;
  display: inline-flex;
  justify-content: center;
`;

const List = styled.ul`
  display: flex;
  flex-flow: row wrap;
  list-style: none;
`;

export const showcase = () => (
  <Icon icon="logo" width="49" height="20" fill="#fff"/>
);


export const noLabels = () => (
  <List>
    { Object.keys(icons).map(key => (
      <Item key={key}>
        {key === 'logo' ?
          <Icon icon={key} aria-label={key} height="20" width="49" /> : <Icon icon={key} aria-label={key} />}
      </Item>
    ))}
  </List>
);
