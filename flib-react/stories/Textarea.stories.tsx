import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { boolean, number, text, withKnobs } from '@storybook/addon-knobs';
import Textarea from '../src/components/inputs/textarea';
import { Store, State} from "@sambego/storybook-state";

export default {
  title: 'Textarea',
  decorators: [
    withKnobs
  ],
  component: Textarea
};


interface StoreObject {
  currentCount: string | number;
}

let storeObject: StoreObject = {
  currentCount: 0
};

const keypress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
  const target = e.target as HTMLTextAreaElement;

  store.set({
    currentCount: target.value.length
  })
};

const store = new Store(storeObject);

export const Text = () => (
  <State store={store}>
    {state => [
      <Textarea
        currentCount={state.currentCount}
        error={boolean('Error', false)}
        errorMessage={text('Error message', 'Error')}
        label={text('Label', 'Label')}
        keyPress={keypress}
        name={text('Input name', 'example')}
        onChange={action('typing...')}
        placeholder={text('Placeholder', 'Placeholder')}
        value={text('Value', '')}
        maxChar={number('Max character', 250)}
      />
    ]}
  </State>
);

