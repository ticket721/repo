import * as React from 'react';
import ColorPicker from '../../src/components/color-picker'
import {  withKnobs, text, array } from '@storybook/addon-knobs';
import { ColorResult } from 'react-color';
import { Store, State} from '@sambego/storybook-state';

export default {
  component: ColorPicker,
  decorators: [
    withKnobs
  ],
  title: 'Desktop|ColorPicker'
}

const handleChange = (color: ColorResult) => {
  store.set({
    color: color.hex
  })
}

const store = new Store({
  color: '#00FBFF'
})

const colors = [] = [];

export const showcase = () => (
    <State store={store}>
      {state => [
        <ColorPicker
          label={text('Label', 'Primary Color')}
          color={state.color}
          handleChange={handleChange}
          presetLabel={text('Preset colors label', 'Color from main image')}
          presetColors={array('Preset colors:', colors)}
        />
      ]}
    </State>

);
