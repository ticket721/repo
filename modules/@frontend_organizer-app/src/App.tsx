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
// import { EventMenu }        from './screens/Event/EventMenu';
import MediaQuery           from 'react-responsive';
import { routes }           from './routes';
import { FullPageLoading }  from '@frontend/flib-react/lib/components';
import './core/event_creation/locales';
import './shared/Translations/global';
import { UserContextGuard } from '@frontend/core/lib/utils/UserContext';
import { FeatureFlag }      from '@frontend/core/lib/components/FeatureFlag';
import { ProtectedByOwnership } from '@frontend/core/lib/components/ProtectedByOwnership';

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
                    <Suspense fallback={<FullPageLoading/>}>
                        <Switch>
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
                                                                <EventPageWrapper>
                                                                    {/* <EventMenu/> */}
                                                                    <div>
                                                                        <Page/>
                                                                    </div>
                                                                </EventPageWrapper>
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
                    <ToastStacker />
                </AppContainer>
            </UserContextGuard>
        </Suspense>
    );
};

const AppContainer = styled.div`
    width: 100%;
`;

const PageWrapper = styled.div`
    padding: 50px;
    margin-top: 80px;
`;

const EventPageWrapper = styled.div`
    margin-left: 280px;
    width: calc(100% - 280px);
    display: flex;
    justify-content: center;

    & > div:last-child {
        width: 600px;
    }
`;

export default withRouter(App);
