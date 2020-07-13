import React                                                   from 'react';
import ReactDOM                                                from 'react-dom';
import './index.css';
import './native';
import './routes/locales';
import App                                                     from './App';
import * as serviceWorker                                      from './serviceWorker';
import { Provider }                                            from 'react-redux';
import { Store }                                               from 'redux';
import { configureStore, history }                             from '@frontend/core/lib/redux';
import { BrowserRouter }                                       from 'react-router-dom';
import { ConnectedRouter }                                     from 'connected-react-router';
import { ThemeProvider }                                       from 'styled-components';
import { ScrollToTop }                                         from '@frontend/core/lib/components';
import { GlobalStyles }                                        from '@frontend/flib-react/lib/shared';
import { customThemes }                                        from '@frontend/flib-react/lib/config/theme';
import { EnvValidator }                                        from '@frontend/core/lib/components/EnvValidator';
import { T721AppEnvSchema }                                    from './utils/env';
import MediaQuery                                              from 'react-responsive';
import MobileApp                                               from './MobileApp';
import Web3                                                    from 'web3';
import { getWeb3 }                                             from '@frontend/core/lib/subspace/getWeb3';
import { LocationReducer, locationInitialState, locationSaga } from './redux/ducks/location';
import { T721AppState }                                        from './redux';
import { searchInitialState, SearchReducer }                   from './redux/ducks/search';
import { cartInitialState, CartReducer, cartSaga }                         from './redux/ducks/cart';
import { deviceWalletInitialState, DeviceWalletReducer, deviceWalletSaga } from './redux/ducks/device_wallet';
import {Elements}                                              from '@stripe/react-stripe-js';
import {loadStripe}                                            from '@stripe/stripe-js';
// tslint:disable-next-line:no-var-requires
const { SubspaceProvider } = require('@embarklabs/subspace-react');

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_API_KEY);

const store: Store<T721AppState> = configureStore<any>({
    location: LocationReducer,
    search: SearchReducer,
    cart: CartReducer,
    deviceWallet: DeviceWalletReducer,
}, {
    location: locationInitialState,
    search: searchInitialState,
    cart: cartInitialState,
    deviceWallet: deviceWalletInitialState,
}, [
    locationSaga,
    cartSaga,
    deviceWalletSaga,
]);

const web3: Web3 = getWeb3();

ReactDOM.render(
    <EnvValidator schema={T721AppEnvSchema}>
        <Elements stripe={stripePromise}>
            <SubspaceProvider web3={web3}>
                <Provider store={store}>
                    <ConnectedRouter history={history}>
                        <ThemeProvider theme={customThemes['t721']}>
                            <GlobalStyles/>
                            <BrowserRouter>
                                <ScrollToTop>
                                    <MediaQuery maxDeviceWidth={1224}>
                                        <MobileApp/>
                                    </MediaQuery>
                                    <MediaQuery minDeviceWidth={1224}>
                                        <App/>
                                    </MediaQuery>
                                </ScrollToTop>
                            </BrowserRouter>
                        </ThemeProvider>
                    </ConnectedRouter>
                </Provider>
            </SubspaceProvider>
        </Elements>
    </EnvValidator>,
    document.getElementById('root'),
);

serviceWorker.register();
