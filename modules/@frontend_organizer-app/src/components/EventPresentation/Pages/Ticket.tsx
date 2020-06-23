import React from 'react';
import { Events } from '../../../types/UserEvents';

interface Props {
  userEvent: Events;
  currentDate: string | undefined;
}

const Ticket = ({ userEvent, currentDate }: Props) => {
  return (<div>Ticket</div>)
};

export default Ticket;
