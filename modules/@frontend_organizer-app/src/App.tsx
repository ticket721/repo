import React, { Suspense, useEffect, useState } from 'react';

import { Route, Switch, useLocation, withRouter } from 'react-router-dom';

import { routes }       from './routes';

import Navbar               from './shared/Navbar';
import { AppState }         from '@frontend/core/lib/redux';

import ProtectedRoute  from '@frontend/core/lib/components/ProtectedRoute';
import { useSelector } from 'react-redux';
import styled          from 'styled-components';
import { AppStatus }   from '@frontend/core/lib/redux/ducks/statuses';
import ToastStacker    from '@frontend/core/lib/components/ToastStacker';
import './core/event_creation/locales';
import { EventMenu }   from './screens/Event/EventMenu';

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
        <Switch>
          {
            appStatus === AppStatus.Ready && routes.map((route, idx) => {
              const page: JSX.Element = (
                <PageWrapper>
                    {
                        route.path.match(/\/:groupId\/date/) &&
                        <EventMenu />
                    }
                  <route.page />
                </PageWrapper>
              );

              if (route.protected) {
                  return <ProtectedRoute path={route.path} key={idx}>
                      {page}
                  </ProtectedRoute>
              }

                        return <Route key={idx} path={route.path} >
                            <route.page />
                        </Route>
                    })
                }
            </Switch>
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

export default withRouter(App);
