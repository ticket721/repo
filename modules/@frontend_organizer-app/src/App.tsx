import React, { Suspense, useEffect, useState } from 'react';

import { Route, Switch, useLocation, withRouter } from 'react-router-dom';

import Navbar               from './shared/Navbar';
import { AppState }         from '@frontend/core/lib/redux';

import ProtectedRoute  from '@frontend/core/lib/components/ProtectedRoute';
import { useSelector } from 'react-redux';
import styled          from 'styled-components';
import { AppStatus }   from '@frontend/core/lib/redux/ducks/statuses';
import ToastStacker    from '@frontend/core/lib/components/ToastStacker';
import './core/event_creation/locales';
import { EventMenu }   from './screens/Event/EventMenu';
import { Login, Register }       from '@frontend/core/lib/components';

import Dashboard          from './screens/Dashboard';
import CreateEvent        from './screens/CreateEvent';
import Preview            from './screens/Event/Preview';
import UpdateGeneralInfos from './screens/Event/UpdateGeneralInfos';
import NewCategory        from './screens/Event/NewCategory';
import UpdateStyles       from './screens/Event/UpdateStyles';
import UpdateLocation     from './screens/Event/UpdateLocation';
import NewDate            from './screens/Event/NewDate';
import FetchDate          from './screens/Event/FetchDate';

const App: React.FC = () => {
  const [ validated, setValidated ] = useState(true);
  const authState = useSelector(((state: AppState) => state.auth));
  const appStatus = useSelector(((state: AppState) => state.statuses.appStatus));
  const location = useLocation();

  useEffect(() => {
    setValidated(authState.user?.validated);
  }, [ authState.user ]);

  return (
    <Suspense fallback='loading'>
      <AppContainer>
        {
          validated &&
          location.pathname !== '/register' && location.pathname !== '/login' &&
          <Navbar/>
        }
        {
          appStatus === AppStatus.Ready &&
          <Switch>
              <Route path='/login' exact>
                  <PageWrapper>
                      <Login/>
                  </PageWrapper>
              </Route>

              <Route path='/register' exact>
                  <PageWrapper>
                      <Register/>
                  </PageWrapper>
              </Route>

              <ProtectedRoute path='/create-event' exact>
                  <PageWrapper>
                      <CreateEvent/>
                  </PageWrapper>
              </ProtectedRoute>

              <ProtectedRoute path='/' exact>
                  <PageWrapper>
                      <Dashboard/>
                  </PageWrapper>
              </ProtectedRoute>

              <ProtectedRoute path='/:groupId/date/:dateId/category' exact>
                  <PageWrapper>
                      <EventPageWrapper>
                          <EventMenu/>
                          <NewCategory/>
                      </EventPageWrapper>
                  </PageWrapper>
              </ProtectedRoute>

              <ProtectedRoute path='/:groupId/date/:dateId/general-infos' exact>
                  <PageWrapper>
                      <EventPageWrapper>
                          <EventMenu/>
                          <UpdateGeneralInfos/>
                      </EventPageWrapper>
                  </PageWrapper>
              </ProtectedRoute>

              <ProtectedRoute path='/:groupId/date/:dateId/styles' exact>
                  <PageWrapper>
                      <EventPageWrapper>
                          <EventMenu/>
                          <UpdateStyles/>
                      </EventPageWrapper>
                  </PageWrapper>
              </ProtectedRoute>

              <ProtectedRoute path='/:groupId/date/:dateId/location' exact>
                  <PageWrapper>
                      <EventPageWrapper>
                          <EventMenu/>
                          <UpdateLocation/>
                      </EventPageWrapper>
                  </PageWrapper>
              </ProtectedRoute>

              <ProtectedRoute path='/:groupId/date/:dateId' exact>
                  <PageWrapper>
                      <EventPageWrapper>
                          <EventMenu/>
                          <Preview/>
                      </EventPageWrapper>
                  </PageWrapper>
              </ProtectedRoute>

              <ProtectedRoute path='/:groupId/new-date/:eventId' exact>
                  <PageWrapper>
                      <EventPageWrapper>
                          <EventMenu/>
                          <NewDate/>
                      </EventPageWrapper>
                  </PageWrapper>
              </ProtectedRoute>

              <ProtectedRoute path='/:groupId' exact>
                  <PageWrapper>
                      <FetchDate/>
                  </PageWrapper>
              </ProtectedRoute>
          </Switch>
        }
            <ToastStacker additionalLocales={[
                'organizer_error_notifications',
            ]} />
        </AppContainer>
      </Suspense>
    )
};

const AppContainer = styled.div`
    width: 100%;
`;

const PageWrapper = styled.div`
    padding: 50px;
    margin-top: 80px;
`;

const EventPageWrapper = styled.div`
    margin-left: 280px;
    width: calc(100% - 280px);
    display: flex;
    justify-content: center;

    & > *:last-child {
        width: 600px;
    }
`;

export default withRouter(App);
