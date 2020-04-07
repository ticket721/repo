import React from 'react';
import { Navbar } from '@libs/components/navbar';
import { Icon } from '@libs/components/icon';

import { Route, Switch, withRouter } from 'react-router-dom';

import Link                   from '@libs/components/link';

import { links, routes } from './routes';
import { PageContainer } from '@libs/components/PageContainer';

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
                <Link
                  key={idx}
                  to={link.to}
                  isActive={location.pathname === link.to}>
                  <Icon
                    icon={link.icon}
                    fill='#fff'
                    height={link.height ? link.height : null}
                    width={link.width ? link.width : null} />
                </Link>
              ))
            }
          </Navbar> :
          null
        }
    </div>
);

export default withRouter(App);
