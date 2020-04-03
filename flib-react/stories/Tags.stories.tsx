import * as React from 'react';
import { text, withKnobs } from '@storybook/addon-knobs';
import Tags from '../src/components/tags';
import { Store, State} from "@sambego/storybook-state";

const maxItems:number = 2;

interface StoreObject {
  tags: Tag[];
  inputValue: string;
  items: number;
}

interface Tag {
  label: string;
  value: string;
}

const createTags = (label: string) => ({
  label: label,
  value: label
});

const onChange = (value: any) => {
  const itemsNumber = !value ? 0 : value.length;

  store.set({
    items: itemsNumber,
    tags: value
  })
};

const onInputChange = (inputValue: string) => {
  store.set({inputValue: inputValue})
};

const onKeyDown = (e: React.KeyboardEvent<HTMLElement>, value: string) => {
  const tags = store.get('tags');
  const tagsLength = tags ? tags.length : 0;

  if(!store.get('inputValue') || tagsLength === maxItems) return;

  switch (e.key) {
    case 'Enter':
    case 'Tab':
      store.set({ inputValue: '' });

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

      store.set({'items': tagsLength + 1});

    e.preventDefault();
  }
};

export default {
  component: Tags,
  decorators: [
    withKnobs
  ],
  title: 'Tags'
};

let storeObject: StoreObject = {
  tags: [],
  items: 0,
  inputValue: ""
};

const store = new Store(storeObject);

export const showcase = () => (
  <State store={store}>
    {state => [
      <Tags
        label={text('Label', 'Tags')}
        placeholder={text('Placeholder', 'Add a tag, then press enter')}
        inputValue={state.inputValue}
        value={state.tags}
        currentTagsNumber={state.items}
        maxTags={maxItems}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onInputChange={onInputChange}
      />
    ]}
  </State>
);

