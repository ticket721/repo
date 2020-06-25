import React from 'react';
import { Events } from '../../../types/UserEvents';

interface Props {
  userEvent: Events;
  currentDate: string | undefined;
}

const Presentation = ({ userEvent, currentDate }: Props) => {
  return (<div>Presentation</div>)
};

export default Presentation;
