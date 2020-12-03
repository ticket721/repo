import React, { PropsWithChildren, useEffect } from 'react';
import ReactDOM                                from 'react-dom';
import './index.css';
import './native';
import './routes/locales';
import './locales';
import * as serviceWorker                                      from './serviceWorker';
import { Provider }                                            from 'react-redux';
import { Store }                                               from 'redux';
import { configureStore, history }                             from '@frontend/core/lib/redux';
import { BrowserRouter }                                       from 'react-router-dom';
import { ConnectedRouter }                  from 'connected-react-router';
import { ThemeProvider } from 'styled-components';
import { ScrollToTop }                                                     from '@frontend/core/lib/components';
import { GlobalStyles }                                                    from '@frontend/flib-react/lib/shared';
import { customThemes }                                                    from '@frontend/flib-react/lib/config/theme';
import { EnvValidator }                                                    from '@frontend/core/lib/components/EnvValidator';
import { T721AppEnvSchema }                                                from './utils/env';
import App                                                                 from './App';
import { LocationReducer, locationInitialState, locationSaga }             from './redux/ducks/location';
import { T721AppState }                                                    from './redux';
import { searchInitialState, SearchReducer }                               from './redux/ducks/search';
import { deviceWalletInitialState, DeviceWalletReducer, deviceWalletSaga } from './redux/ducks/device_wallet';
import { splashSaga }                                                      from './redux/ducks/splash/sagas';
import { init }                                                            from '@frontend/core/lib/tracking/init';
import { pageview }                                                        from '@frontend/core/lib/tracking/pageview';
import { useHistory }                                                      from 'react-router';

const store: Store<T721AppState> = configureStore<any>({
    location: LocationReducer,
    search: SearchReducer,
    deviceWallet: DeviceWalletReducer,
}, {
    location: locationInitialState,
    search: searchInitialState,
    deviceWallet: deviceWalletInitialState,
}, [
    locationSaga,
    deviceWalletSaga,
    splashSaga
]);

init();

const PageViewTracker: React.FC<PropsWithChildren<any>> = ({children}: PropsWithChildren<any>) => {
    const _history = useHistory();

    useEffect(() => {
        if (_history) {
            pageview(`${_history.location.pathname}${_history.location.search}`);
            _history.listen((location): void => {
                pageview(`${location.pathname}${location.search}`);
            });

        }
    }, [_history]);

    return children;
}

const Root = () => {

    return <EnvValidator schema={T721AppEnvSchema}>
        <Provider store={store}>
            <ConnectedRouter history={history}>
                <ThemeProvider theme={customThemes['t721']}>
                    <GlobalStyles/>
                    <BrowserRouter>
                        <PageViewTracker>
                            <ScrollToTop>
                                <App/>
                            </ScrollToTop>
                        </PageViewTracker>
                    </BrowserRouter>
                </ThemeProvider>
            </ConnectedRouter>
        </Provider>
    </EnvValidator>;

}

ReactDOM.render(
    <Root/>,
    document.getElementById('root'),
);

serviceWorker.register();
