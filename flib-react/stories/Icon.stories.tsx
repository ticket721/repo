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
  component: Icon,
  parameters: {
    viewport: {
      defaultViewport: 'iphonex'
    }
  }
};

const Item = styled.li`
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  flex: 0 1 20%;
  min-width: 120px;

  padding: 0px 7.5px 20px;

  svg {
    margin-right: 10px;
    width: 24px;
    height: 24px;
  }


`;

const List = styled.ul`
  display: flex;
  flex-flow: row wrap;
  list-style: none;
`;

export const showcase = () => (
  <Icon icon="facehappy"/>
);


export const noLabels = () => (
  <List>
    {Object.keys(icons).map(key => (
      <Item key={key}>
        <Icon icon={key} aria-label={key} />
      </Item>
    ))}
  </List>
);
