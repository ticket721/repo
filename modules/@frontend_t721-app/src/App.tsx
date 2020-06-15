import React, { Suspense } from 'react';
import {
    PageContainer
}                                               from '@frontend/core/lib/components';

import { Route, Switch, withRouter } from 'react-router-dom';

import {  routes }     from './routes';
import { AppStatus }   from '@frontend/core/lib/redux/ducks/statuses';
import ProtectedRoute  from '@frontend/core/lib/components/ProtectedRoute';
import { useSelector } from 'react-redux';
import { AppState }    from '@frontend/core/lib/redux';
import ToastStacker    from '@frontend/core/lib/components/ToastStacker';
import styled          from 'styled-components';

const App: React.FC = () => {

    const appStatus = useSelector(((state: AppState) => state.statuses.appStatus));

    return <Suspense fallback='loading'>
        <AppContainer>
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
            <ToastStacker additionalLocales={[]}/>
        </AppContainer>
    </Suspense>
};

const AppContainer = styled.div`
  width: 100%;
  height: 100vh;
`;


export default withRouter(App);
