import * as React from 'react';
import {object, text, withKnobs} from '@storybook/addon-knobs';
import Location from '../../src/components/location';

const selectValues = [
  { value: 'Phil Smoke Meat, 188 avenue Jean Jaurès, Paris', label: 'Phil Smoke Meat, 188 avenue Jean Jaurès, Paris' },
  { value: 'Philharmonie de Paris, 221 avenue Jean Jaurès, Paris', label: 'Philharmonie de Paris, 221 avenue Jean Jaurès, Paris' },
  { value: 'Philharmonie de Nantes, 236 avenue Jean Jaurès, Nantes', label: 'Philharmonie de Nantes, 236 avenue Jean Jaurès, Nantes' }
];

export default {
  component: Location,
  decorators: [
    withKnobs
  ],
  title: 'Desktop|Location'
};

export const showcase = () => (
  <Location
    label={text('Label', 'Location')}
    placeholder={text('Placeholder', 'Type an address')}
    options={object('Values', selectValues)}
  />
);
