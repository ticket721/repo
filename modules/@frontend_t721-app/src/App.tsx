import React from 'react';
import {
    PageContainer
} from '@frontend/core/lib/components';

import { NavLink, Route, Switch, withRouter } from 'react-router-dom';

import { links, routes } from './routes';
import { Navbar, Icon }            from '@frontend/flib-react/lib/components';

const App: React.FC = ({ location }: any) => (
    <div id='App'>
        <Switch>
            {
                routes.map((route, idx) => (
                    <Route key={idx} path={route.path}>
                        <PageContainer
                        padding='40px 40px 110px'
                        topBar={route.topBar}
                        topBarHeight={route.topBarHeight}>
                            <route.page />
                        </PageContainer>
                    </Route>
                ))
            }
        </Switch>
        {
            location.pathname.lastIndexOf('/') === 0 ?
            <Navbar>
                {
                    links.map((link, idx) => (
                        <NavLink
                        key={idx}
                        to={link.to}>
                            <Icon
                            icon={link.icon}
                            fill='#fff'
                            height={link.height ? link.height : undefined}
                            width={link.width ? link.width : undefined} />
                        </NavLink>
                    ))
                }
            </Navbar> :
            null
        }
    </div>
);

export default withRouter(App);
