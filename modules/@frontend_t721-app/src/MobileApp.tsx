import React, { useEffect, useState, Suspense, useCallback, PropsWithChildren, useContext } from 'react';
import { Route, Switch, useHistory, useLocation, withRouter, Redirect }                     from 'react-router-dom';
import { TopNav, FullPageLoading }                                                          from '@frontend/flib-react/lib/components';
import ProtectedRoute                                                                       from '@frontend/core/lib/components/ProtectedRoute';
import ToastStacker                                                                         from '@frontend/core/lib/components/ToastStacker';
import styled                                                                               from 'styled-components';
import { T721Navbar }                                                                       from './components/NavBar';
import AdminRoutePage                                                                       from './routes/Admin';
import LoginPage                                                                            from './routes/Login';
import RegisterPage                                                                         from './routes/Register';
import HomePage                                                                             from './routes/Home';
import ProfileActivitiesPage                                                                from './routes/Activities';
import ProfileLanguagePage                                                                  from './routes/Language';
import ProfilePage                                                                          from './routes/Profile';
import SearchViewAllPage                                                                    from './routes/SearchViewAll';
import EventPage                                                                            from './routes/Event';
import TicketPage                                                                           from './routes/Ticket';
import TicketSelectionPage                                                                  from './routes/TicketSelection';
import SearchPage                                                                           from './routes/Search';
import TagsPage                                                                             from './routes/Tags';
import WalletPage                                                                           from './routes/Wallet';
import CartPage                                                                             from './routes/Cart';
import ValidateRoutePage                                                                    from './routes/ValidateRoute';
import CloseRedirectPage                                                                    from './routes/CloseRedirect';
import StripeSetupPage                                                                      from './routes/StripeSetup';
import StripeTransactionsPage                                                               from './routes/StripeTransactions';
import StripeWithdrawPage                                                                   from './routes/StripeWithdraw';
import StripeCreateBankAccountPage                                                          from './routes/StripeCreateBankAccount';
import { useKeyboardVisibility }                                                            from '@frontend/core/lib/utils/useKeyboardVisibility';
import { UserContextGuard }                                                                 from '@frontend/core/lib/utils/UserContext';
import DeepLinksListener                                                                    from './components/DeepLinksListener';
import MediaQuery                                                                           from 'react-responsive';
import { useFlag }                                                                          from '@frontend/core/lib/utils/useFlag';
import { useSelector }                                                                      from 'react-redux';
import { CartContext, CartContextManager }                                                  from './components/Cart/CartContext';
import { T721AppState }                                                                     from './redux';
import { CartButton }                                                                       from './components/CartButton';
import { CartMenu }                                                                         from './components/CartMenu';
import { TicketsContextGuard }                                                              from '@frontend/core/lib/utils/TicketsContext';

const TopNavWrapper = (props: { back: () => void }): JSX.Element => {
    const [scrolled, setScrolled] = useState(false);

    const setScrolledCallback = useCallback(() => {
        if (!scrolled && window.scrollY > 0) {
            setScrolled(true);
        } else if (scrolled && window.scrollY <= 0) {
            setScrolled(false);
        }
    }, [scrolled]);

    useEffect(() => {
        window.addEventListener('scroll', setScrolledCallback, {
            passive: true,
        });
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
    const token = useSelector((state: T721AppState) => state.auth.token);

    const goBackOrHome = useCallback(() => {
        if (history.length > 2) {
            history.goBack();
        } else {
            history.replace('/');
        }
    }, [history]);

    const flags = {
        stripe_interface_setup: useFlag('stripe_interface_setup'),
        admin_flag: useFlag('admin_flag'),
    };

    return (
        <Suspense fallback={<FullPageLoading/>}>
            <UserContextGuard>
                <TicketsContextGuard>

                    <CartContextManager token={token?.value}>
                        <CartButton/>
                        <CartMenu
                        />
                        <AppContainer>
                            <MediaQuery maxWidth={1224}>
                                {location.pathname.lastIndexOf('/') !== 0 &&
                                location.pathname.indexOf('/_/') !== 0 ? (
                                    <TopNavWrapper back={goBackOrHome}/>
                                ) : null}
                            </MediaQuery>
                            <Switch>

                                {flags.stripe_interface_setup ? (
                                    <ProtectedRoute
                                        path={'/stripe/connect'}
                                        exact={true}
                                    >
                                        <StripeSetupPage/>
                                    </ProtectedRoute>
                                ) : null}

                                {flags.stripe_interface_setup ? (
                                    <ProtectedRoute
                                        path={'/stripe/create-bank-account'}
                                        exact={true}
                                    >
                                        <StripeCreateBankAccountPage/>
                                    </ProtectedRoute>
                                ) : null}

                                {flags.stripe_interface_setup ? (
                                    <ProtectedRoute
                                        path={'/stripe/withdraw'}
                                        exact={true}
                                    >
                                        <StripeWithdrawPage/>
                                    </ProtectedRoute>
                                ) : null}

                                {flags.stripe_interface_setup ? (
                                    <ProtectedRoute
                                        path={'/stripe/transactions'}
                                        exact={true}
                                    >
                                        <StripeTransactionsPage/>
                                    </ProtectedRoute>
                                ) : null}

                                {flags.admin_flag ? (
                                    <ProtectedRoute
                                        path={'/you/are/an/admin'}
                                        exact={true}
                                    >
                                        <AdminRoutePage/>
                                    </ProtectedRoute>
                                ) : null}

                                <Route path={'/_/redirect/close'} exact={true}>
                                    <CloseRedirectPage/>
                                </Route>

                                <Route path={'/login'} exact={true}>
                                    <LoginPage/>
                                </Route>

                                <Route path={'/register'} exact={true}>
                                    <RegisterPage/>
                                </Route>

                                <Route path={'/'} exact={true}>
                                    <HomePage/>
                                </Route>

                                <ProtectedRoute
                                    path={'/profile/activities'}
                                    exact={true}
                                >
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

                                <Redirect to={'/'}/>
                            </Switch>
                            <MediaQuery maxWidth={1224}>
                                <T721Navbar
                                    visible={
                                        location.pathname.lastIndexOf('/') === 0 &&
                                        !keyboardIsVisible
                                    }
                                />
                            </MediaQuery>
                            <ToastStacker additionalLocales={[]}/>
                        </AppContainer>
                    </CartContextManager>
                </TicketsContextGuard>
            </UserContextGuard>
            <DeepLinksListener/>
        </Suspense>
    );
};

interface AppContainerDivProps {
    checkoutOpen: boolean;
    margin: number;
}

const AppContainerDiv = styled.div<AppContainerDivProps>`
    ${props => props.checkoutOpen

    ?
    `
        overflow: hidden;
        margin-top: -${props.margin}px;
    `

    :
    `
    `
}
    width: 100%;
    height: 100%;
`;

const AppContainer: React.FC<PropsWithChildren<any>> = (props: PropsWithChildren<any>) => {

    const cart = useContext(CartContext);
    const [savedPos] = useState(0);

    useEffect(() => {
        if (cart.open) {
            document.getElementsByTagName('body')[0].style.overflow = 'hidden';
            return () => {
                document.getElementsByTagName('body')[0].style.overflow = 'auto';
            };
        }
    }, [cart.open]);

    return <AppContainerDiv
        checkoutOpen={false}
        margin={savedPos}
    >
        {props.children}
    </AppContainerDiv>;
};

export default withRouter(MobileApp);
