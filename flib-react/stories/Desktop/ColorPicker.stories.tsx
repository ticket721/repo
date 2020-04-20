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

const handleClick = () => {
  store.set({
    showPicker: !store.get('showPicker')
  })
}

const store = new Store({
  color: '#00FBFF',
  showPicker: false
})

const colors = [] = [];

export const showcase = () => (
    <State store={store}>
      {state => [
        <ColorPicker
          label={text('Label', 'Primary Color')}
          color={state.color}
          handleChange={handleChange}
          handleClick={handleClick}
          presetLabel={text('Preset colors label', 'Color from main image')}
          presetColors={array('Preset colors:', colors)}
          showPicker={state.showPicker}
        />
      ]}
    </State>

);
