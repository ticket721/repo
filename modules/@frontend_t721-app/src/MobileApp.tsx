import React, { useEffect, useState }                                   from 'react';
import { Route, Switch, useHistory, useLocation, withRouter, Redirect } from 'react-router-dom';
import { TopNav }                                                       from '@frontend/flib-react/lib/components';
import ProtectedRoute                                                   from '@frontend/core/lib/components/ProtectedRoute';
import ToastStacker                                                     from '@frontend/core/lib/components/ToastStacker';
import styled                                                           from 'styled-components';
import { T721Navbar }                                                   from './components/NavBar';
import LoginPage                                                        from './routes/Login';
import RegisterPage                                                     from './routes/Register';
import HomePage                                                         from './routes/Home';
import ProfileActivitiesPage                                            from './routes/Activities';
import ProfileLanguagePage                                              from './routes/Language';
import ProfilePage                                                      from './routes/Profile';
import SearchViewAllPage                                                from './routes/SearchViewAll';
import EventPage                                                        from './routes/Event';
import TicketPage                                                       from './routes/Ticket';
import TicketSelectionPage                                              from './routes/TicketSelection';
import SearchPage                                                       from './routes/Search';
import TagsPage                                                         from './routes/Tags';
import WalletPage                                                       from './routes/Wallet';
import CartPage                                                         from './routes/Cart';

const TopNavWrapper = (props: { back: () => void}): JSX.Element => {

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

    return <TopNav label={''} onPress={props.back} scrolled={scrolled} />;
};

const MobileApp: React.FC = () => {

    const location = useLocation();
    const history = useHistory();

    return <>
        <AppContainer>
            {
                location.pathname.lastIndexOf('/') !== 0

                    ?
                    <TopNavWrapper back={history.goBack}/>

                    :
                    null
            }
            <Switch>
                <Route path={'/login'} exact={true}>
                    <LoginPage/>
                </Route>

                <Route path={'/register'} exact={true}>
                    <RegisterPage/>
                </Route>

                <Route path={'/'} exact={true}>
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

                <ProtectedRoute path={'/wallet'} exact={true}>
                    <WalletPage/>
                </ProtectedRoute>

                <Redirect to={'/'}/>
            </Switch>
            <ToastStacker additionalLocales={[]}/>
            <T721Navbar visible={location.pathname.lastIndexOf('/') === 0}/>
        </AppContainer>
    </>;
};

const AppContainer = styled.div`
  width: 100%;
  height: 100%;
`;

export default withRouter(MobileApp);
