import * as React from 'react';
import { withKnobs, text } from '@storybook/addon-knobs';
import { Store, State} from "@sambego/storybook-state";
import Organizers from '../src/components/organizers';

export default {
  title: 'Invite Organizers',
  decorators: [
    withKnobs
  ],
  component: Organizers
};

interface StoreObject {
  organizers: Organizer[];
  inputValue: string;
}

interface Organizer {
  acceptedOn?: string | Date | null;
  email: string;
  id: string;
  name?: string;
  image: string | undefined;
  status?: string | null;
}

const currentUser = {
  email: 'pete@spektrummedia.com',
  id: '12',
  name: 'Pete (you)',
  image: 'assets/images/user-1.jpg'
}

const createOrganizer = (value:string) => ({
  id: '',
  name: '',
  image: '',
  email: value,
  status: 'Pending',
  acceptedOn: null
})

const sendInvite = () => {
  const value = store.get('inputValue');
  const organizers = store.get('organizers');

  if(!organizers) {
    store.set({ organizers: [
      createOrganizer(value)
    ]});
  } else {
    store.set({ organizers: [
      ...organizers,
      createOrganizer(value)
    ]});
  }
  store.set({
    inputValue: ""
  })
};

const removeUser = (user: Organizer) => {
  const organizers = store.get('organizers');
  const index = organizers.findIndex(x => x.email === user.email);

  organizers.splice(index, 1);
  store.set({
    organizers: organizers
  })
};

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  store.set({
    inputValue: e.target.value
  })
};

let storeObject: StoreObject = {
  organizers: [],
  inputValue: ''
};

const store = new Store(storeObject);

export const showcase = () => (
  <State store={store}>
    {state => [
      <Organizers
        currentUser={currentUser}
        handleChange={handleChange}
        handleRemove={removeUser}
        sendInvite={sendInvite}
        inputLabel={text('Organizers input label', 'Invite organizers')}
        label={text('Organizers label', 'Organizers')}
        organizers={state.organizers}
        placeholder={text('Input placeholder', 'Enter email address')}
        inputValue={state.inputValue}
      />
    ]}
  </State>
)
