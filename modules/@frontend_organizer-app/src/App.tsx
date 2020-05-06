import React from 'react';
import {
    PageContainer
} from '@frontend/core/lib/components';

import { Route, Switch, withRouter } from 'react-router-dom';

import { routes }       from './routes';

import Navbar from './shared/Navbar';

const App: React.FC = ({ location }: any) => (
    <div id='App'>
        <Navbar />
        <Switch>
            {
                routes.map((route, idx) => (
                    <Route key={idx} path={route.path}>
                        <PageContainer
                        padding='50px 30px 30px'
                        topBar={route.topBar}
                        topBarHeight={route.topBarHeight}>
                            <route.page />
                        </PageContainer>
                    </Route>
                ))
            }
        </Switch>
    </div>
);

export default withRouter(App);
