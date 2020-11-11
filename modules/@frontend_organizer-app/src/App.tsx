import React, {
    Suspense
} from 'react';
import {
    Redirect,
    Route,
    Switch,
    useLocation,
    withRouter,
}                           from 'react-router-dom';
import Navbar               from './shared/Navbar';
import { AppState }         from '@frontend/core/lib/redux';
import ProtectedRoute       from '@frontend/core/lib/components/ProtectedRoute';
import { useSelector }      from 'react-redux';
import styled               from 'styled-components';
import { AppStatus }        from '@frontend/core/lib/redux/ducks/statuses';
import ToastStacker         from '@frontend/core/lib/components/ToastStacker';
import MediaQuery           from 'react-responsive';
import { routes }           from './routes';
import { FullPageLoading }  from '@frontend/flib-react/lib/components';
import './shared/Translations/global';
import { UserContextGuard } from '@frontend/core/lib/utils/UserContext';
import { FeatureFlag }      from '@frontend/core/lib/components/FeatureFlag';
import { ProtectedByOwnership } from '@frontend/core/lib/components/ProtectedByOwnership';
import { EventsDrawer } from './components/EventsDrawer';

const App: React.FC = () => {
    const appStatus = useSelector(((state: AppState) => state.statuses.appStatus));
    const location = useLocation();

    return (
        <Suspense fallback={<FullPageLoading/>}>
            <UserContextGuard>
                <AppContainer>
                    <MediaQuery minWidth={1224}>
                        {
                            location.pathname !== '/register' && location.pathname !== '/login'

                                ?
                                <Navbar/>

                                :
                                null
                        }
                    </MediaQuery>
                    {
                        location.pathname.startsWith('/event') || location.pathname === '/' ?
                        <EventsDrawer/> :
                        null
                    }
                    <Suspense fallback={<FullPageLoading/>}>
                        <Switch location={location} key={location.pathname}>
                            {
                                appStatus === AppStatus.Ready

                                    ?
                                    routes.map((route, idx) => {

                                        let Page;

                                        if (route.flag) {
                                            Page = () => <FeatureFlag flag={route.flag}>
                                                <route.page/>
                                            </FeatureFlag>
                                        } else {
                                            Page = route.page;
                                        }

                                        if (route.protected) {

                                            return <ProtectedRoute exact={true} path={route.path} key={idx}>
                                                <PageWrapper>
                                                    {
                                                        route.entityParam ?
                                                            <ProtectedByOwnership entityType={route.entityType} entityParam={route.entityParam}>
                                                                <Page/>
                                                            </ProtectedByOwnership>
                                                            :
                                                            <Page/>
                                                    }
                                                </PageWrapper>
                                            </ProtectedRoute>;

                                        }
                                        return <Route exact={true} key={idx} path={route.path}>
                                            <Page/>
                                        </Route>;
                                    })
                                    :
                                    null
                            }
                            <Redirect to={'/'}/>
                        </Switch>
                    </Suspense>
                    <ToastStacker additionalLocales={[]}/>
                </AppContainer>
            </UserContextGuard>
        </Suspense>
    );
};

const AppContainer = styled.div`
    width: 100%;
`;

const PageWrapper = styled.div`
    padding: 50px 0;
    margin-top: 80px;
`;

export default withRouter(App);
