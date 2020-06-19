import React, { Suspense } from 'react';
import {
    PageContainer
}                                               from '@frontend/core/lib/components';

import { NavLink, Route, Switch, useHistory, useLocation, withRouter } from 'react-router-dom';

import { links, routes }                         from './mobileRoutes';
import { FullPageLoading, Navbar, Icon, TopNav } from '@frontend/flib-react/lib/components';
import { AppStatus }                             from '@frontend/core/lib/redux/ducks/statuses';
import ProtectedRoute    from '@frontend/core/lib/components/ProtectedRoute';
import { useSelector }   from 'react-redux';
import { AppState }      from '@frontend/core/lib/redux';
import ToastStacker      from '@frontend/core/lib/components/ToastStacker';
import styled            from 'styled-components';

const MobileApp: React.FC = () => {

    const appStatus = useSelector(((state: AppState) => state.statuses.appStatus));
    const location = useLocation();
    const history = useHistory();

    return <Suspense fallback={FullPageLoading}>
        <AppContainer>
            {
                location.pathname.lastIndexOf('/') !== 0 ?
                    <TopNav label={''} onPress={history.goBack}/> : null
            }
            <Switch>
                {
                    appStatus === AppStatus.Ready && routes.map((route, idx) => {
                        const page = <PageContainer
                            adding='40px 40px 110px'
                            topBar={route.topBar}
                            topBarHeight={route.topBarHeight}>
                            <route.page/>
                        </PageContainer>;

                        if (route.protected) {
                            return <ProtectedRoute path={route.path} key={idx} page={page}/>
                        }

                        return <Route key={idx} path={route.path}>
                            <route.page/>
                        </Route>
                    })
                }
            </Switch>
            <ToastStacker additionalLocales={[]}/>
            {
                location.pathname.lastIndexOf('/') === 0 ?
                    <Navbar>
                        {
                            links.map((link, idx) => (
                                <NavLink
                                    exact={true}
                                    key={idx}
                                    to={link.to}>
                                    <Icon
                                        icon={link.icon}
                                        color='#FFFFFF'
                                        size={link.size}/>
                                </NavLink>
                            ))
                        }
                    </Navbar> :
                    null
            }
        </AppContainer>
    </Suspense>
};

const AppContainer = styled.div`
  width: 100%;
  height: 100vh;
`;

export default withRouter(MobileApp);
