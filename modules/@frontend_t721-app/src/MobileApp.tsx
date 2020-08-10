import React, { useEffect, useState, Suspense, useCallback }            from 'react';
import { Route, Switch, useHistory, useLocation, withRouter, Redirect } from 'react-router-dom';
import { TopNav, FullPageLoading }                                      from '@frontend/flib-react/lib/components';
import ProtectedRoute                                                   from '@frontend/core/lib/components/ProtectedRoute';
import ToastStacker                                                     from '@frontend/core/lib/components/ToastStacker';
import styled                                                           from 'styled-components';
import { T721Navbar }                                                   from './components/NavBar';
import AdminRoutePage                                                   from './routes/Admin';
import LoginPage                                                        from './routes/Login';
import ResetPasswordPage                                                from './routes/ResetPassword';
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
import ValidateRoutePage                                                from './routes/ValidateRoute';
import { useKeyboardVisibility }                                        from '@frontend/core/lib/utils/useKeyboardVisibility';
import { UserContextGuard }                                             from '@frontend/core/lib/utils/UserContext';
import DeepLinksListener                                                from './components/DeepLinksListener';
import MediaQuery                                                       from 'react-responsive';
import { FeatureFlag }                                                  from '@frontend/core/lib/components/FeatureFlag';

const TopNavWrapper = (props: { back: () => void }): JSX.Element => {

    const [scrolled, setScrolled] = useState(false);

    const setScrolledCallback = useCallback(() => {
        console.log(scrolled, window.scrollY);
        if (!scrolled && window.scrollY !== 0) {
            setScrolled(true);
        } else if (scrolled && window.scrollY === 0) {
            setScrolled(false);
        }
    }, [scrolled]);

    useEffect(() => {
        window.addEventListener('scroll', setScrolledCallback, { passive: true });
        return () => {
            window.removeEventListener('scroll', setScrolledCallback);
        };
    }, [setScrolledCallback]);

    return <TopNav label={''} onPress={props.back} scrolled={scrolled}/>;
};

const MobileApp: React.FC = () => {

    const location = useLocation();
    const history = useHistory();
    const keyboardIsVisible = useKeyboardVisibility();

    const goBackOrHome = useCallback(() => {
        if (history.length > 2) {
            history.goBack();
        } else {
            history.replace('/');
        }
    }, [history]);

    return <Suspense fallback={<FullPageLoading/>}>
        <UserContextGuard>
            <AppContainer>
                <MediaQuery maxDeviceWidth={1224}>
                    {
                        location.pathname.lastIndexOf('/') !== 0

                            ?
                            <TopNavWrapper back={goBackOrHome}/>

                            :
                            null
                    }
                </MediaQuery>
                <Switch>
                    <Route path={'/login'} exact={true}>
                        <LoginPage/>
                    </Route>

                    <Route path={'/reset-password'} exact={true}>
                        <ResetPasswordPage />
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

                    <Route path={'/validate-email'} exact={true}>
                        <ValidateRoutePage/>
                    </Route>

                    <FeatureFlag flag={'admin_flag'}>
                        <Route path={'/you/are/an/admin'} exact={true}>
                            <AdminRoutePage/>
                        </Route>
                    </FeatureFlag>

                    <Redirect to={'/'}/>
                </Switch>
                <MediaQuery maxDeviceWidth={1224}>
                    <T721Navbar visible={location.pathname.lastIndexOf('/') === 0 && !keyboardIsVisible}/>
                </MediaQuery>
                <ToastStacker additionalLocales={[]}/>
            </AppContainer>
        </UserContextGuard>
        <DeepLinksListener/>
    </Suspense>;
};

const AppContainer = styled.div`
  width: 100%;
  height: 100%;
`;

export default withRouter(MobileApp);
