import React, { Suspense, useEffect, useState } from 'react';
import {
    Login,
    Register,
} from '@frontend/core/lib/components';

import { NavLink, Route, Switch, useHistory, useLocation, withRouter } from 'react-router-dom';

import { FullPageLoading, Navbar, Icon, TopNav } from '@frontend/flib-react/lib/components';
import ProtectedRoute               from '@frontend/core/lib/components/ProtectedRoute';
import ToastStacker                 from '@frontend/core/lib/components/ToastStacker';
import styled                       from 'styled-components';
import { StatusBarMargin }          from './utils/StatusBarMargin';
import { NavbarMargin }             from './utils/NavbarMargin';
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

const TopNavWrapper = (props: {back: () => void}): JSX.Element => {

    const [scrolled, setScrolled] = useState(false);

    const setScrolledCallback = () => {
        if (!scrolled && window.pageYOffset !== 0) {
            setScrolled(true);
        } else if (scrolled && window.pageYOffset === 0) {
            setScrolled(false);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', setScrolledCallback, { passive: true });
        return () => {
            window.removeEventListener('scroll', setScrolledCallback);
        }
    });

    return <TopNav label={''} onPress={props.back} scrolled={scrolled}/>
};

const LoginPage = StatusBarMargin(NavbarMargin(Login));
const RegisterPage = StatusBarMargin(NavbarMargin(Register));
const HomePage = StatusBarMargin(NavbarMargin(Home));
const ProfileActivitiesPage = InvisibleStatusBarMargin(TopNavMargin(Activities));
const ProfilePage = StatusBarMargin(NavbarMargin(ProfileRoot));
const SearchViewAllPage = InvisibleStatusBarMargin(TopNavMargin(SearchViewAll));
const EventPage = Event;
const SearchPage = StatusBarMargin(Search);
const TagsPage = StatusBarMargin(Tags);
const WalletPage = StatusBarMargin(Wallet);

const MobileApp: React.FC = () => {

    const location = useLocation();
    const history = useHistory();

    return <Suspense fallback={FullPageLoading}>
        <AppContainer>
            {
                location.pathname.lastIndexOf('/') !== 0 ?
                    <TopNavWrapper back={history.goBack}/>
                    : null
            }
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
            {
                location.pathname.lastIndexOf('/') === 0

                    ?
                    <Navbar>
                        <NavLink exact={true} to={'/home'}>
                            <Icon icon={'home'} color='#FFFFFF' size={'22px'}/>
                        </NavLink>

                        <NavLink exact={true} to={'/search'}>
                            <Icon icon={'search'} color='#FFFFFF' size={'22px'}/>
                        </NavLink>

                        <NavLink exact={true} to={'/'}>
                            <Icon icon={'t721'} color='#FFFFFF' size={'22px'}/>
                        </NavLink>

                        <NavLink exact={true} to={'/tags'}>
                            <Icon icon={'tags'} color='#FFFFFF' size={'22px'}/>
                        </NavLink>

                        <NavLink exact={true} to={'/profile'}>
                            <Icon icon={'profile'} color='#FFFFFF' size={'22px'}/>
                        </NavLink>

                    </Navbar>


                    :
                    null
            }
        </AppContainer>
    </Suspense>
};

const AppContainer = styled.div`
  width: 100%;
  height: 100%;
`;

export default withRouter(MobileApp);
