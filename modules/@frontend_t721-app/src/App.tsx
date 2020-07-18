import React from 'react';

import { Redirect, Route, Switch, withRouter } from 'react-router-dom';

import ProtectedRoute               from '@frontend/core/lib/components/ProtectedRoute';
import ToastStacker                 from '@frontend/core/lib/components/ToastStacker';
import styled                       from 'styled-components';
import LoginPage from './routes/Login';
import RegisterPage from './routes/Register';
import HomePage from './routes/Home';
import ProfileActivitiesPage from './routes/Activities';
import ProfileLanguagePage from './routes/Language';
import ProfilePage from './routes/Profile';
import SearchViewAllPage from './routes/SearchViewAll';
import EventPage from './routes/Event';
import TicketSelectionPage from './routes/TicketSelection';
import SearchPage from './routes/Search';
import TagsPage from './routes/Tags';
import CartPage from './routes/Cart';

const App: React.FC = () => {

    return <>
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
    </>;
};

const AppContainer = styled.div`
  width: 100%;
  height: 100vh;
`;

export default withRouter(App);
