import React from 'react';
import { useHistory } from 'react-router';
import { Route, Switch } from 'react-router-dom';
import styled from 'styled-components';

import { Events } from '../../types/UserEvents';

import EventSideMenu from './EventSideMenu';
import { routes } from './routes';

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
  const history = useHistory();

  return (
    <>
      <EventSideMenu
        name={name}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        setName={setName}
        userEvents={userEvents}
      />
      <PageContainer>
        {
          <Switch>
            { routes.map((route, idx) => {
              const id = history.location.pathname.match(/^\/0x([a-zA-Z]|[0-9])+/);
              return (
                <Route
                  path={`${id[0]}${route.path}`}
                  key={idx}
                  component={() => route.path === '/' ?
                    <route.component category={category} /> :
                    <route.component userEvent={userEvent} currentDate={currentDate} />
                  }
                />
              );
            })}
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
