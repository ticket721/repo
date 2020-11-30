import React, {
    PropsWithChildren,
    Suspense,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
}                                                                       from 'react';
import { Redirect, Route, Switch, useHistory, useLocation, withRouter } from 'react-router-dom';
import { FullPageLoading, TopNav }                                      from '@frontend/flib-react/lib/components';
import ProtectedRoute                                                   from '@frontend/core/lib/components/ProtectedRoute';
import ToastStacker                                                     from '@frontend/core/lib/components/ToastStacker';
import { T721Navbar }                                                   from './components/NavBar';
import AdminRoutePage                                                   from './routes/Admin';
import LoginPage                                                        from './routes/Login';
import ResetPage                                                        from './routes/Reset';
import ResetFormPage                                                    from './routes/ResetForm';
import RegisterPage                                                     from './routes/Register';
import HomePage                                                         from './routes/Home';
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
import CloseRedirectPage                                                from './routes/CloseRedirect';
import StripeSetupPage                                                  from './routes/StripeSetup';
import StripeTransactionsPage                                           from './routes/StripeTransactions';
import StripeWithdrawPage                                               from './routes/StripeWithdraw';
import StripeCreateBankAccountPage                                      from './routes/StripeCreateBankAccount';
import { useKeyboardVisibility }                                        from '@frontend/core/lib/utils/useKeyboardVisibility';
import { UserContextGuard }                                             from '@frontend/core/lib/utils/UserContext';
import DeepLinksListener                                                from './components/DeepLinksListener';
import { useMediaQuery }                                                from 'react-responsive';
import { useFlag }                                                      from '@frontend/core/lib/utils/useFlag';
import { useToken }                                                     from '@frontend/core/lib/hooks/useToken';
import { CartContext, CartContextManager }                              from './components/Cart/CartContext';
import { CartButton }                                                   from './components/CartButton';
import { CartMenu }                                                     from './components/CartMenu';
import { TicketsContextGuard }                                          from '@frontend/core/lib/utils/TicketsContext';
import { StripeSDKManager }                                             from '@frontend/core/lib/utils/StripeSDKContext';
import * as Sentry                                                      from '@sentry/react';
import { Integrations }                                                 from '@sentry/tracing';
import { getEnv }                                                       from '@frontend/core/lib/utils/getEnv';
import { Crash }                                                        from '@frontend/core/lib/components/Crash';
import { ErrorBoundary }                                                from 'react-error-boundary';
import { DesktopNavbar }                                                from './components/DesktopNavBar';
import { usePlatform }                                                  from '@capacitor-community/react-hooks/platform';
import { useHaptics, HapticsImpactStyle }                               from '@frontend/core/lib/utils/useHaptics';

const TopNavWrapper = (props: { back: () => void }): JSX.Element => {
    const [scrolled, setScrolled] = useState(false);
    const haptics = useHaptics();

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

    return <TopNav label={''} onPress={() => {
        haptics.impact({
            style: HapticsImpactStyle.Light,
        });
        props.back();
    }} scrolled={scrolled}/>;
};

if (getEnv().REACT_APP_SENTRY_DSN) {
    Sentry.init({
        dsn: getEnv().REACT_APP_SENTRY_DSN,
        integrations: [
            new Integrations.BrowserTracing(),
        ],
        tracesSampleRate: 1.0,
        release: getEnv().REACT_APP_RELEASE,
    });
    console.log(`Initialized Sentry for release ${getEnv().REACT_APP_RELEASE}`);
}

const App: React.FC = () => {
    const location = useLocation();
    const history = useHistory();
    const keyboardIsVisible = useKeyboardVisibility();
    const token = useToken();
    const isUnder900 = useMediaQuery({ maxWidth: 900 });
    const platform = usePlatform();
    const isMobileNavigation = useMemo(() =>
        platform.platform === 'ios'
        || platform.platform === 'android'
        || isUnder900,
        [platform, isUnder900],
    );

    const goBackOrHome = useCallback(() => {
        if (history.length > 1) {
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
                    <StripeSDKManager>
                        <CartContextManager token={token}>
                            <CartButton/>
                            <CartMenu/>
                            {
                                !isMobileNavigation

                                    ?
                                    <DesktopNavbar/>

                                    :
                                    null
                            }
                            <AppContainer>
                                {
                                    isMobileNavigation &&
                                    location.pathname.lastIndexOf('/') !== 0 &&
                                    location.pathname.indexOf('/_/') !== 0 ? (
                                        <TopNavWrapper back={goBackOrHome}/>
                                    ) : null}
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

                                    <Route path={'/reset'} exact={true}>
                                        <ResetPage/>
                                    </Route>

                                    <Route path={'/reset-form'} exact={true}>
                                        <ResetFormPage/>
                                    </Route>

                                    <Route path={'/'} exact={true}>
                                        <HomePage/>
                                    </Route>

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
                                {
                                    isMobileNavigation

                                        ?
                                        <T721Navbar
                                            visible={
                                                location.pathname.lastIndexOf('/') === 0 &&
                                                !keyboardIsVisible
                                            }
                                        />

                                        :
                                        null
                                }
                            </AppContainer>
                        </CartContextManager>
                    </StripeSDKManager>
                </TicketsContextGuard>
            </UserContextGuard>
            <ToastStacker additionalLocales={[]}/>
            <DeepLinksListener/>
        </Suspense>
    );
};

const AppContainer: React.FC<PropsWithChildren<any>> = (props: PropsWithChildren<any>) => {
    const cart = useContext(CartContext);

    useEffect(() => {
        if (cart.open) {
            document.getElementsByTagName('body')[0].style.overflow = 'hidden';
            return () => {
                document.getElementsByTagName('body')[0].style.overflow = 'auto';
            };
        }
    }, [cart.open]);

    return props.children;
};

let WrappedApp: any = withRouter(App);

if (getEnv().REACT_APP_SENTRY_DSN) {
    WrappedApp = Sentry.withErrorBoundary(
        Sentry.withProfiler(
            WrappedApp,
        )
        , {
            fallback: ({ eventId }: any) => (<Crash
                onClick={() => {
                    Sentry.showReportDialog({
                        eventId,
                    });
                }}
            />),
        },
    );
} else {
    const CurerntWrappedApp = WrappedApp;
    WrappedApp = () => <ErrorBoundary
        FallbackComponent={Crash as any}
    >
        <CurerntWrappedApp/>
    </ErrorBoundary>;
}

export default WrappedApp;
