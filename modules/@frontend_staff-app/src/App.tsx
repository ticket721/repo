import React, { lazy, Suspense, useEffect }                 from 'react';
import { Switch, useLocation, withRouter, Redirect, Route } from 'react-router-dom';
import { FullPageLoading }                                  from '@frontend/flib-react/lib/components';
import ProtectedRoute                                       from '@frontend/core/lib/components/ProtectedRoute';
import ToastStacker                                         from '@frontend/core/lib/components/ToastStacker';
import styled                                               from 'styled-components';
import { StaffNavbar }                                      from './shared/NavBar';
import { useDispatch }                                      from 'react-redux';
import { SetupDate }                                        from './redux/ducks/current_event';
import { UserContextGuard }                                 from '@frontend/core/lib/utils/UserContext';
import { FeatureFlag }                                      from '@frontend/core/lib/components/FeatureFlag';

const LoginPage = lazy(() => import('./routes/Login'));
const ScanPage = lazy(() => import('./routes/Scan'));
const GuestListPage = lazy(() => import('./routes/GuestList'));
const StatsPage = lazy(() => import('./routes/Stats'));
const AdminPage = lazy(() => import('./routes/Admin'));

const App: React.FC = () => {
    const dispatch = useDispatch();
    const location = useLocation();

    // eslint-disable-next-line
    useEffect(() => void dispatch(SetupDate()), []);

    return <Suspense fallback={<FullPageLoading/>}>
        <UserContextGuard>
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

                        <FeatureFlag flag={'admin_flag'}>
                            <Route path={'/you/are/an/admin'} exact={true}>
                                <AdminPage/>
                            </Route>
                        </FeatureFlag>

                        <Redirect to={'/stats'}/>
                    </Switch>
                </Suspense>
                <ToastStacker additionalLocales={[]}/>
                <StaffNavbar visible={
                    location.pathname !== '/register' && location.pathname !== '/login' &&
                    location.pathname.lastIndexOf('/') === 0
                }/>
            </AppContainer>
        </UserContextGuard>
    </Suspense>;
};

const AppContainer = styled.div`
  width: 100%;
  height: 100%;
`;

export default withRouter(App);
