import React from 'react';
import styled from 'styled-components';

import { Events } from "../../../types/UserEvents";

import GeneralInformation from "./GeneralInformation";
import Dates from "./Dates";
import Location from "./Location";
import Presentation from "./Presentation";
import Ticket from "./Ticket";

interface Props {
  page: string;
  userEvent: Events;
  currentDate: string | undefined;
}

const Pages = ({ page, userEvent, currentDate }: Props) => {
  const pages = {
    general: <GeneralInformation userEvent={userEvent} currentDate={currentDate} />,
    dates: <Dates userEvent={userEvent} currentDate={currentDate} />,
    location: <Location />,
    presentation: <Presentation />,
    ticket: <Ticket />
  };

  console.log('page to render : ', page);
  return (
    <Container>{pages[page]}</Container>
  );
};

const Container = styled.div`
  width: 100%;
  margin: 0 20px;
  min-width: 300px;
`;

export default Pages;
