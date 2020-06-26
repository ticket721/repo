import React, { Suspense } from 'react';

import { Route, Switch, withRouter } from 'react-router-dom';

import ProtectedRoute               from '@frontend/core/lib/components/ProtectedRoute';
import ToastStacker                 from '@frontend/core/lib/components/ToastStacker';
import styled                       from 'styled-components';
import { StatusBarMargin }          from './utils/StatusBarMargin';
import { NavbarMargin }             from './utils/NavbarMargin';
import { Login, Register }          from '@frontend/core/lib/components';
import Home                         from './screens/Home';
import { InvisibleStatusBarMargin } from './utils/InvisibleStatusBarMargin';
import { TopNavMargin }             from './utils/TopNavMargin';
import Activities                   from '@frontend/core/lib/components/Profile/Activities';
import ProfileRoot                  from '@frontend/core/lib/components/Profile/Root';
import SearchViewAll                from './screens/SearchViewAll';
import Search                       from './screens/Search';
import Tags                         from './screens/Tags';
import Wallet                       from './screens/Wallet';
import Event                        from './screens/Event';
import { FullPageLoading }          from '@frontend/flib-react/lib/components';
import TicketSelection              from './screens/TicketSelection';

const LoginPage = StatusBarMargin(NavbarMargin(Login));
const RegisterPage = StatusBarMargin(NavbarMargin(Register));
const HomePage = StatusBarMargin(NavbarMargin(Home));
const ProfileActivitiesPage = InvisibleStatusBarMargin(TopNavMargin(Activities));
const ProfilePage = StatusBarMargin(NavbarMargin(ProfileRoot));
const SearchViewAllPage = InvisibleStatusBarMargin(TopNavMargin(SearchViewAll));
const EventPage = Event;
const TicketSelectionPage = InvisibleStatusBarMargin(TopNavMargin(TicketSelection));
const SearchPage = StatusBarMargin(Search);
const TagsPage = StatusBarMargin(Tags);
const WalletPage = StatusBarMargin(Wallet);

const App: React.FC = () => {

    return <Suspense fallback={FullPageLoading}>
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

                <ProtectedRoute path={'/profile'} exact={true}>
                    <ProfilePage/>
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

                <ProtectedRoute path={'/'} exact={true}>
                    <WalletPage/>
                </ProtectedRoute>
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
