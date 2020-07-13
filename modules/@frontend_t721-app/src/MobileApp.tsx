import React, { lazy, Suspense, useEffect, useState }         from 'react';
import { Route, Switch, useHistory, useLocation, withRouter } from 'react-router-dom';
import { FullPageLoading, TopNav }                            from '@frontend/flib-react/lib/components';
import ProtectedRoute                                         from '@frontend/core/lib/components/ProtectedRoute';
import ToastStacker                                           from '@frontend/core/lib/components/ToastStacker';
import styled                                                 from 'styled-components';
import { T721Navbar }                                         from './components/NavBar';

const TopNavWrapper = (props: { back: () => void }): JSX.Element => {

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
        };
    });

    return <TopNav label={''} onPress={props.back} scrolled={scrolled}/>;
};

const LoginPage = lazy(() => import('./routes/Login'));
const RegisterPage = lazy(() => import('./routes/Register'));
const HomePage = lazy(() => import('./routes/Home'));
const ProfileActivitiesPage = lazy(() => import('./routes/Activities'));
const ProfileLanguagePage = lazy(() => import('./routes/Language'));
const ProfilePage = lazy(() => import('./routes/Profile'));
const SearchViewAllPage = lazy(() => import('./routes/SearchViewAll'));
const EventPage = lazy(() => import('./routes/Event'));
const TicketPage = lazy(() => import('./routes/Ticket'));
const TicketSelectionPage = lazy(() => import('./routes/TicketSelection'));
const SearchPage = lazy(() => import('./routes/Search'));
const TagsPage = lazy(() => import('./routes/Tags'));
const WalletPage = lazy(() => import('./routes/Wallet'));
const CartPage = lazy(() => import('./routes/Cart'));

const MobileApp: React.FC = () => {

    const location = useLocation();
    const history = useHistory();

    return <Suspense fallback={<FullPageLoading/>}>
        <AppContainer>
            {
                location.pathname.lastIndexOf('/') !== 0 ?
                    <TopNavWrapper back={history.goBack}/>
                    : null
            }
            <Suspense fallback={<FullPageLoading/>}>
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

                    <ProtectedRoute path={'/ticket/:id'} exact={true}>
                        <TicketPage/>
                    </ProtectedRoute>

                    <ProtectedRoute path={'/'} exact={true}>
                        <WalletPage/>
                    </ProtectedRoute>
                    <Redirect to={'/'}/>
                </Switch>
            </Suspense>
            <ToastStacker additionalLocales={[]}/>
            {
                location.pathname.lastIndexOf('/') === 0

                    ?
                    <T721Navbar/>

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

export default withRouter(MobileApp);
