import React, { Suspense, useEffect, useState } from 'react';
import {
    PageContainer
}                                               from '@frontend/core/lib/components';

import { Route, Switch, useLocation, withRouter } from 'react-router-dom';

import { routes }       from './routes';

import Navbar               from './shared/Navbar';
import { AppState }         from '@frontend/core/lib/redux';
import ProtectedRoute       from '@frontend/core/lib/components/ProtectedRoute';
import { useSelector }      from 'react-redux';
import styled               from 'styled-components';
import NotificationsStacker from '@frontend/core/lib/components/NotificationsStacker';
import { AppStatus }        from '@frontend/core/lib/redux/ducks/statuses';

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
                        const page = <PageContainer
                          padding='50px 30px 30px'
                          topBar={route.topBar}
                          topBarHeight={route.topBarHeight}>
                            <route.page />
                        </PageContainer>;

                        if (route.protected) {
                            return <ProtectedRoute path={route.path} key={idx} page={page} />
                        }

                        return <Route key={idx} path={route.path}>
                            <route.page />
                        </Route>
                    })
                }
            </Switch>
            <NotificationsStacker />
        </AppContainer>
      </Suspense>
    )
};

const AppContainer = styled.div`
    position: absolute;
    width: 100%;
`;

export default withRouter(App);
