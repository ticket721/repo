import React, { lazy, Suspense, useEffect }                 from 'react';
import { Switch, useLocation, withRouter, Redirect, Route } from 'react-router-dom';
import { FullPageLoading }                                  from '@frontend/flib-react/lib/components';
import ProtectedRoute                                       from '@frontend/core/lib/components/ProtectedRoute';
import ToastStacker                                         from '@frontend/core/lib/components/ToastStacker';
import styled                                               from 'styled-components';
import { StaffNavbar }                                      from './shared/NavBar';
import { useSelector }                                      from 'react-redux';
import { AppState }                                         from '@frontend/core/lib/redux';
import { useDispatch }                                      from 'react-redux';
import { SetupDate }                                        from './redux/ducks/current_event';

const LoginPage = lazy(() => import('./routes/Login'));
const ScanPage = lazy(() => import('./routes/Scan'));
const GuestListPage = lazy(() => import('./routes/GuestList'));
const StatsPage = lazy(() => import('./routes/Stats'));

const App: React.FC = () => {
    const dispatch = useDispatch();
    const authState = useSelector(((state: AppState) => state.auth));
    const location = useLocation();

    // eslint-disable-next-line
    useEffect(() => void dispatch(SetupDate()), []);

    return <Suspense fallback={<FullPageLoading/>}>
        <AppContainer>
            <Suspense fallback={<FullPageLoading/>}>
                <Switch>
                    <Route path={'/login'} exact={true}>
                        <LoginPage/>
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
            <ToastStacker additionalLocales={[]}/>
            {
                authState.user?.validated &&
                location.pathname !== '/register' && location.pathname !== '/login' &&
                location.pathname.lastIndexOf('/') === 0

                    ?
                    <StaffNavbar/>

                    :
                    null
            }
        </AppContainer>
    </Suspense>;
};

const AppContainer = styled.div`
  width: 100%;
  height: 100%;
`;

export default withRouter(App);
