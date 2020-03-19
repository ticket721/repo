import * as React from 'react';
// import { action } from '@storybook/addon-actions';
import { text, withKnobs } from '@storybook/addon-knobs';
import Tags from '../src/components/tags';
import { Store, State} from "@sambego/storybook-state";

const onChange = (value: any) => {
  console.log(value)
  store.set({value: value})
}

const onInputChange = (inputValue: string) => {
  store.set({inputValue: inputValue})
}

const onKeyDown = (e: React.KeyboardEvent<HTMLElement>, value: string) => {
  switch (e.key) {
    case 'Enter':
    case 'Tab':
      store.set({inputValue: ''})
      store.set({ value:
        [ ...store.get('value'),
          {
            label: value,
            value: value
          }
        ]
      })
      e.preventDefault();
  }
};

export default {
  title: 'Tags',
  decorators: [
    withKnobs
  ],
  component: Tags
};

const store = new Store({
  key: 0,
  value: [{
    value: 'OI',
    label: 'OI OI',
  }],
  inputValue: ''
});


export const showcase = () => (
  <State store={store}>
    {state =>[
      <Tags
        label={text('Label', 'Tags')}
        placeholder={text('Placeholder', 'Add a tag, then press enter')}
        inputValue={state.inputValue}
        value={state.value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onInputChange={onInputChange}
      />
    ]}
  </State>
);

