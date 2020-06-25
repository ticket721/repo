import React from 'react';
import { useParams } from 'react-router';
import { Route, Switch } from 'react-router-dom';
import styled from 'styled-components';

import { Events } from '../../types/UserEvents';

import EventSideMenu from './EventSideMenu';
import GeneralInformation from './Pages/GeneralInformation';
import Ticket from './Pages/Ticket';
import Presentation from './Pages/Presentation';
import AddDate from './Pages/AddDate';
import Preview from './Pages/Preview';

interface Props {
  currentDate: string | undefined;
  setCurrentDate: (name: string) => void;
  setName: (startDate: string) => void;
  name: string;
  userEvents: Events[];
}

const EventPresentation = ({ currentDate, setName, setCurrentDate, name, userEvents }: Props) => {
  const userEvent = userEvents.find((e) => e.name === name);
  const category = userEvents.find((e) => e.name === name)?.dates[0];
  const { group_id } = useParams();

  return (
    <>
      <EventSideMenu
        name={name}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        setName={setName}
      />
      <PageContainer>
        {
          <Switch>
            <Route path={`/${group_id}/informations`}>
              <GeneralInformation userEvent={userEvent} currentDate={currentDate} />
            </Route>
            <Route path={`/${group_id}/ticket`}>
              <Ticket userEvent={userEvent} currentDate={currentDate} />
            </Route>
            <Route path={`/${group_id}/presentation`}>
              <Presentation userEvent={userEvent} currentDate={currentDate} />
            </Route>
            <Route path={`/${group_id}/add-date`}>
              <AddDate userEvent={userEvent} currentDate={currentDate} />
            </Route>
            <Route path={`/${group_id}`}>
              <Preview category={category} />
            </Route>
          </Switch>
        }
      </PageContainer>
    </>
  );
};

const PageContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: calc(100% - 280px);
  margin-left: 280px;
`;

export default EventPresentation;
