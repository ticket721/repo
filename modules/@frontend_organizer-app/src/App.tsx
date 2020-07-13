import React, {
    Suspense,
    useEffect,
    useState
}                           from 'react';
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
import ProtectedByRights    from '@frontend/core/lib/components/ProtectedByRights';
import { useSelector }      from 'react-redux';
import styled               from 'styled-components';
import { AppStatus }        from '@frontend/core/lib/redux/ducks/statuses';
import ToastStacker         from '@frontend/core/lib/components/ToastStacker';
import { EventMenu }        from './screens/Event/EventMenu';
import MediaQuery           from 'react-responsive';
import { routes }           from './routes';
import { FullPageLoading }  from '@frontend/flib-react/lib/components';
import './core/event_creation/locales';
import './shared/Translations/global';

const App: React.FC = () => {
    const [validated, setValidated] = useState(true);
    const authState = useSelector(((state: AppState) => state.auth));
    const appStatus = useSelector(((state: AppState) => state.statuses.appStatus));
    const location = useLocation();

    useEffect(() => {
        setValidated(authState.user?.validated);
    }, [authState.user]);

    return (
        <Suspense fallback={<FullPageLoading/>}>
            <AppContainer>
                <MediaQuery minDeviceWidth={1224}>
                    {
                        validated &&
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

                                    if (route.protected) {
                                        return <ProtectedRoute exact={true} path={route.path} key={idx}>
                                            <PageWrapper>
                                                {
                                                    route.path.match(/^\/group\/:groupId/) ?
                                                        <ProtectedByRights type={route.entityType} value={route.paramId}>
                                                            <EventPageWrapper>
                                                                <EventMenu/>
                                                                <div>
                                                                    <route.page/>
                                                                </div>
                                                          </EventPageWrapper>
                                                        </ProtectedByRights>
                                                    :
                                                        <route.page/>
                                                }
                                            </PageWrapper>
                                        </ProtectedRoute>;
                                    }
                                    return <Route exact={true} key={idx} path={route.path}>
                                        <route.page/>
                                    </Route>;
                                })

                                :
                                null
                        }
                        <Redirect to={'/'}/>
                    </Switch>
                </Suspense>
                <ToastStacker additionalLocales={[
                    'organizer_error_notifications',
                ]}/>
            </AppContainer>
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
