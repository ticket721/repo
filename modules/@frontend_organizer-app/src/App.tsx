import React, { Suspense, useEffect, useState } from 'react';
import {
    PageContainer
}                                               from '@frontend/core/lib/components';

import { Route, Switch, withRouter } from 'react-router-dom';

import { routes }       from './routes';

import Navbar          from './shared/Navbar';
import { AppState }    from '@frontend/core/lib/redux';
import ProtectedRoute  from '@frontend/core/lib/components/ProtectedRoute';
import { useSelector } from 'react-redux';
import styled          from 'styled-components';

const App: React.FC = () => {
    const [ authenticated, setAuthenticated ] = useState(true);
    const [ validated, setValidated ] = useState(true);
    const authState = useSelector(((state: AppState) => state.auth));

    useEffect(() => {
        if (!authState.token) {
            setAuthenticated(false);
        }

        setValidated(authState.user?.validated);
    }, [ authState ]);

    return (
      <Suspense fallback='loading'>
        <AppContainer>
            {
                authenticated && validated ?
                <Navbar/> :
                null
            }
            <Switch>
                {
                    routes.map((route, idx) => {
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
        </AppContainer>
      </Suspense>
    )
};

const AppContainer = styled.div`
    position: absolute;
    width: 100%;
`;

export default withRouter(App);
