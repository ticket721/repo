import React, { Suspense, useEffect, useState } from 'react';
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

const TopNavWrapper = (props: {back: () => void}): JSX.Element => {

    const [scrolled, setScrolled] = useState(false);

    const setScrolledCallback = () => {
        if (!scrolled && window.pageYOffset !== 0) {
            setScrolled(true);
        } else if (scrolled && window.pageYOffset === 0) {
            setScrolled(false);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', setScrolledCallback, { passive: true });
        return () => {
            window.removeEventListener('scroll', setScrolledCallback);
        }
    });

    return <TopNav label={''} onPress={props.back} scrolled={scrolled}/>
};


const MobileApp: React.FC = () => {

    const appStatus = useSelector(((state: AppState) => state.statuses.appStatus));
    const location = useLocation();
    const history = useHistory();

    return <Suspense fallback={FullPageLoading}>
        <AppContainer>
            {
                location.pathname.lastIndexOf('/') !== 0 ?
                    <TopNavWrapper back={history.goBack}/>
                    : null
            }
            <Switch>
                {
                    appStatus === AppStatus.Ready && routes.map((route, idx) => {
                        const page = <PageContainer
                            topBar={route.topBar}
                            topBarHeight={route.topBarHeight}>
                            <route.page/>
                        </PageContainer>;

                        if (route.protected) {
                            return <ProtectedRoute path={route.path} key={idx} page={page}/>
                        }

                        return <Route key={idx} path={route.path} exact={true}>
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
  height: 100%;
`;

export default withRouter(MobileApp);
