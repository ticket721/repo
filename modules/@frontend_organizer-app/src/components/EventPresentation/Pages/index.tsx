import React from 'react';
import GeneralInformation from "./GeneralInformation";
import Dates from "./Dates";
import Location from "./Location";
import Presentation from "./Presentation";
import Ticket from "./Ticket";

interface Props {
  page: string;
}

const Pages = ({ page }: Props) => {
  const pages = {
    general: <GeneralInformation />,
    dates: <Dates />,
    location: <Location />,
    presentation: <Presentation />,
    ticket: <Ticket />
  };

  return (
    <div>{pages[page]}</div>
  );
};

export default Pages;
