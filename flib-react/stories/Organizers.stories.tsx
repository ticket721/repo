import * as React from 'react';
import { withKnobs, text } from '@storybook/addon-knobs';
import Organizers from '../src/components/organizers';

export default {
  title: 'Invite Organizers',
  decorators: [
    withKnobs
  ],
  component: Organizers
};
const currentUser = {
  id: 1,
  name: 'Pete (you)',
  image: 'assets/images/user-1.jpg'
}

const organizers = [
  {
    id: 1,
    name: 'Jim Smiths',
    image: 'assets/images/user-1.jpg',
    status: 'Inivitation send',
    acceptedOn: null
  },
  {
    id: 2,
    name: 'BOB',
    image: 'assets/images/user-1.jpg',
    status: 'Accepted',
    acceptedOn: '31/01/2020'
  }
]
const sendInvite = () => {
 console.log('okok');
};

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  console.log(e.target.value)
};

export const showcase = () => (
  <Organizers
    currentUser={currentUser}
    handleChange={handleChange}
    sendInvite={sendInvite}
    inputLabel={text('Organizers input label', 'Invite organizers')}
    label={text('Organizers label', 'Organizers')}
    organizers={organizers}
    placeholder={text('Input placeholder', 'Enter email address')}
  />
);
