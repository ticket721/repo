import React, { Suspense, useEffect }                       from 'react';
import { Switch, useLocation, withRouter, Redirect, Route } from 'react-router-dom';
import { FullPageLoading }                                  from '@frontend/flib-react/lib/components';
import ProtectedRoute                                       from '@frontend/core/lib/components/ProtectedRoute';
import ToastStacker                                         from '@frontend/core/lib/components/ToastStacker';
import styled                                               from 'styled-components';
import { StaffNavbar }                                      from './shared/NavBar';
import { useDispatch }      from 'react-redux';
import { SetupDate }        from './redux/ducks/current_event';
import { UserContextGuard } from '@frontend/core/lib/utils/UserContext';
import LoginPage            from './routes/Login';
import ResetFormPage        from './routes/ResetForm';
import ResetPage            from './routes/Reset';
import ScanPage             from './routes/Scan';
import GuestListPage        from './routes/GuestList';
import StatsPage            from './routes/Stats';
import AdminPage            from './routes/Admin';
import { useFlag }          from '@frontend/core/lib/utils/useFlag';
import { getEnv }           from '@frontend/core/lib/utils/getEnv';
import * as Sentry          from '@sentry/react';
import { Integrations }     from '@sentry/tracing';

if (getEnv().REACT_APP_SENTRY_DSN) {
    Sentry.init({
        dsn: getEnv().REACT_APP_SENTRY_DSN,
        integrations: [
            new Integrations.BrowserTracing(),
        ],

        // We recommend adjusting this value in production, or using tracesSampler
        // for finer control
        tracesSampleRate: 1.0,
    });
}

const App: React.FC = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const adminFlag = useFlag('admin_flag');

    // eslint-disable-next-line
    useEffect(() => void dispatch(SetupDate()), []);

    return <Suspense fallback={<FullPageLoading/>}>
        <UserContextGuard>
            <AppContainer>
                <Suspense fallback={<FullPageLoading/>}>
                    <Switch>

                        {
                            adminFlag

                                ?
                                <Route path={'/you/are/an/admin'} exact={true}>
                                    <AdminPage/>
                                </Route>

                                :
                                null
                        }

                        <Route path={'/login'} exact={true}>
                            <LoginPage/>
                        </Route>

                        <Route path={'/reset'} exact={true}>
                            <ResetPage/>
                        </Route>

                        <Route path={'/reset-form'} exact={true}>
                            <ResetFormPage/>
                        </Route>

                        <ProtectedRoute path={'/stats'} exact={true}>
                            <StatsPage/>
                        </ProtectedRoute>

                        <ProtectedRoute path={'/list'} exact={true}>
                            <GuestListPage/>
                        </ProtectedRoute>

                        <ProtectedRoute path={'/ticket/scanner'} exact={true}>
                            <ScanPage/>
                        </ProtectedRoute>

                        <Redirect to={'/stats'}/>
                    </Switch>
                </Suspense>
                <StaffNavbar visible={
                    location.pathname !== '/register' && location.pathname !== '/login' &&
                    location.pathname.lastIndexOf('/') === 0
                }/>
            </AppContainer>
        </UserContextGuard>
        <ToastStacker additionalLocales={[]}/>
    </Suspense>;
};

const AppContainer = styled.div`
  width: 100%;
  height: 100%;
`;

export default withRouter(App);
