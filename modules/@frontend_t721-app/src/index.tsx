import React                                 from 'react';
import ReactDOM                              from 'react-dom';
import './index.css';
import './native'
import App                                   from './App';
import * as serviceWorker                    from './serviceWorker';
import { Provider }                          from 'react-redux';
import { Store }                             from 'redux';
import { AppState, configureStore, history } from '@frontend/core/lib/redux';
import { BrowserRouter }                     from 'react-router-dom';
import { ConnectedRouter }                   from 'connected-react-router';
import { ThemeProvider }                     from 'styled-components';
import { ScrollToTop }                       from '@frontend/core/lib/components';
import { GlobalStyles }                      from '@frontend/flib-react/lib/shared';
import { customThemes }                      from '@frontend/flib-react/lib/config/theme';
import { EnvValidator }                      from '@frontend/core/lib/components/EnvValidator';
import { T721AppEnvSchema }                  from './utils/env';
import MediaQuery                            from 'react-responsive';
import MobileApp                             from './MobileApp';

const store: Store<AppState> = configureStore();

ReactDOM.render(
    <EnvValidator schema={T721AppEnvSchema}>
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
    </EnvValidator>,
    document.getElementById('root'),
);

serviceWorker.register();
