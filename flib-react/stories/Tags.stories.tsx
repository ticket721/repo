import * as React from 'react';
import { text, withKnobs } from '@storybook/addon-knobs';
import Tags from '../src/components/tags';
import { Store, State} from "@sambego/storybook-state";

interface StoreObject {
  tags: Tag[];
  inputValue: string;
};
interface Tag {
  label: string;
  value: string;
};

interface Tag {
  label: string,
  value: string
}

const createTags = (label: string) => ({
  label,
  value: label
})

const onChange = (value: any) => {
  store.set({ tags: value })
}

const onInputChange = (inputValue: string) => {
  store.set({inputValue: inputValue})
}

const onKeyDown = (e: React.KeyboardEvent<HTMLElement>, value: string) => {
  const tags = store.get('tags');
  if(!store.get('inputValue')) return;

  switch (e.key) {
    case 'Enter':
    case 'Tab':
      store.set({ inputValue: '' })

      if(!tags) {
        store.set({ tags: [
          createTags(value)
        ]})
      } else {
        store.set({ tags: [
          ...tags,
          createTags(value)
        ]})
      }

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

let storeObject: StoreObject = {
  tags: [],
  inputValue: ""
}

const store = new Store(storeObject);

export const showcase = () => (
  <State store={store}>
    {state =>[
      <Tags
        label={text('Label', 'Tags')}
        placeholder={text('Placeholder', 'Add a tag, then press enter')}
        inputValue={state.inputValue}
        value={state.tags}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onInputChange={onInputChange}
      />
    ]}
  </State>
);

