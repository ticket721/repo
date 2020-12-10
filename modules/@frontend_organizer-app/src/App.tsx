import React, {
    Suspense, useContext,
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
import styled                            from 'styled-components';
import { AppStatus }                     from '@frontend/core/lib/redux/ducks/statuses';
import ToastStacker                      from '@frontend/core/lib/components/ToastStacker';
import MediaQuery                        from 'react-responsive';
import { routes }                        from './routes';
import { FullPageLoading }               from '@frontend/flib-react/lib/components';
import './shared/Translations/global';
import { UserContext, UserContextGuard } from '@frontend/core/lib/contexts/UserContext';
import { EventsContextGuard } from '@frontend/core/lib/contexts/EventsContext';
import { FeatureFlag }                   from '@frontend/core/lib/components/FeatureFlag';
import { ProtectedByOwnership }          from '@frontend/core/lib/components/ProtectedByOwnership';
import { EventsDrawer }                  from './shared/EventsDrawer';
import { StripeSDKManager }              from '@frontend/core/lib/contexts/StripeSDKContext';
import { getEnv }                        from '@frontend/core/lib/utils/getEnv';
import * as Sentry                       from '@sentry/react';
import { Integrations }                  from '@sentry/tracing';
import { Crash }                         from '@frontend/core/lib/components/Crash';
import { ErrorBoundary }                                                                    from 'react-error-boundary';

const EventsDrawerWrapper = (): JSX.Element => {

    const location = useLocation();
    const user  = useContext(UserContext);

    return <>
        {
            (location.pathname.startsWith('/event') || location.pathname === '/') && user?.valid === true ?
                <EventsDrawer/> :
                null
        }
    </>
}

if (getEnv().REACT_APP_SENTRY_DSN) {
    Sentry.init({
        dsn: getEnv().REACT_APP_SENTRY_DSN,
        integrations: [
            new Integrations.BrowserTracing(),
        ],
        tracesSampleRate: 1.0,
        release: getEnv().REACT_APP_RELEASE
    });
    console.log(`Initialized Sentry for release ${getEnv().REACT_APP_RELEASE}`);
}

const App: React.FC = () => {
    const appStatus = useSelector(((state: AppState) => state.statuses.appStatus));
    const location = useLocation();

    return (
        <Suspense fallback={<FullPageLoading/>}>
            <UserContextGuard>
                <EventsContextGuard>
                    <StripeSDKManager>
                        <AppContainer>
                            <MediaQuery minDeviceWidth={900}>
                                {
                                    location.pathname !== '/register' && location.pathname !== '/login'

                                        ?
                                        <Navbar/>

                                        :
                                        null
                                }
                            </MediaQuery>
                            <EventsDrawerWrapper/>
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
                                                                    <ProtectedByOwnership
                                                                    entityType={route.entityType}
                                                                    entityParam={route.entityParam}>
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
                        </AppContainer>
                    </StripeSDKManager>
                </EventsContextGuard>
            </UserContextGuard>
            <ToastStacker additionalLocales={[]}/>
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

let WrappedApp: any = withRouter(App);

if (getEnv().REACT_APP_SENTRY_DSN) {
    WrappedApp = Sentry.withErrorBoundary(
        Sentry.withProfiler(
            WrappedApp,
        )
        , {
            fallback: ({ eventId }: any) => (<Crash
                onClick={() => {
                    Sentry.showReportDialog({
                        eventId,
                    });
                }}
            />),
        },
    );
} else {
    const CurerntWrappedApp = WrappedApp;
    WrappedApp = () => <ErrorBoundary
        FallbackComponent={Crash as any}
    >
        <CurerntWrappedApp/>
    </ErrorBoundary>
}

export default WrappedApp;
