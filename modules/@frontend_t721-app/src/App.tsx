import React, { lazy, Suspense } from 'react';

import { Redirect, Route, Switch, withRouter } from 'react-router-dom';

import ProtectedRoute               from '@frontend/core/lib/components/ProtectedRoute';
import ToastStacker                 from '@frontend/core/lib/components/ToastStacker';
import styled                       from 'styled-components';
import { FullPageLoading }          from '@frontend/flib-react/lib/components';

const LoginPage = lazy(() => import('./routes/Login'));
const RegisterPage = lazy(() => import('./routes/Register'));
const HomePage = lazy(() => import('./routes/Home'));
const ProfileActivitiesPage = lazy(() => import('./routes/Activities'));
const ProfileLanguagePage = lazy(() => import('./routes/Language'));
const ProfilePage = lazy(() => import('./routes/Profile'));
const SearchViewAllPage = lazy(() => import('./routes/SearchViewAll'));
const EventPage = lazy(() => import('./routes/Event'));
const TicketSelectionPage = lazy(() => import('./routes/TicketSelection'));
const SearchPage = lazy(() => import('./routes/Search'));
const TagsPage = lazy(() => import('./routes/Tags'));
const WalletPage = lazy(() => import('./routes/Wallet'));
const CartPage = lazy(() => import('./routes/Cart'));

const App: React.FC = () => {

    return <Suspense fallback={<FullPageLoading/>}>
        <AppContainer>
            <Switch>
                <Route path={'/login'} exact={true}>
                    <LoginPage/>
                </Route>

                <Route path={'/register'} exact={true}>
                    <RegisterPage/>
                </Route>

                <Route path={'/home'} exact={true}>
                    <HomePage/>
                </Route>

                <ProtectedRoute path={'/profile/activities'} exact={true}>
                    <ProfileActivitiesPage/>
                </ProtectedRoute>

                <ProtectedRoute path={'/profile/language'} exact={true}>
                    <ProfileLanguagePage/>
                </ProtectedRoute>

                <ProtectedRoute path={'/profile'} exact={true}>
                    <ProfilePage/>
                </ProtectedRoute>

                <ProtectedRoute path={'/cart/checkout'} exact={true}>
                    <CartPage/>
                </ProtectedRoute>

                <Route path={'/search/events/:query'} exact={true}>
                    <SearchViewAllPage/>
                </Route>

                <Route path={'/event/:id/selection'} exact={true}>
                    <TicketSelectionPage/>
                </Route>

                <Route path={'/event/:id'} exact={true}>
                    <EventPage/>
                </Route>

                <Route path={'/search'} exact={true}>
                    <SearchPage/>
                </Route>

                <Route path={'/tags'} exact={true}>
                    <TagsPage/>
                </Route>
                <Redirect to={'/home'}/>
            </Switch>
            <ToastStacker additionalLocales={[]}/>
        </AppContainer>
    </Suspense>;
};

const AppContainer = styled.div`
  width: 100%;
  height: 100vh;
`;

export default withRouter(App);
