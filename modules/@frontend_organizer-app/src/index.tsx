import React                               from 'react';
import ReactDOM                              from 'react-dom';
import './index.css';
import App                                   from './App';
import * as serviceWorker                    from './serviceWorker';
import {Provider}                            from 'react-redux';
import {Store}                               from 'redux';
import { AppState, configureStore, history } from '@frontend/core/lib/redux';
import { organizerInitialState, organizerReducer, organizerSagas, OrganizerState } from './redux/ducks';
import {BrowserRouter}                       from 'react-router-dom';
import { ConnectedRouter }                   from 'connected-react-router';
import { ThemeProvider }                     from 'styled-components';
import { ScrollToTop }                       from '@frontend/core/lib/components';
import { GlobalStyles }                      from '@frontend/flib-react/lib/shared';
import { customThemes }                      from '@frontend/flib-react/lib/config/theme';
import { EnvValidator }                      from '@frontend/core/lib/components/EnvValidator';
import { OrganizerAppEnvSchema }             from './utils/env';

export type MergedAppState = AppState & OrganizerState;

export const store: Store<MergedAppState> = configureStore<OrganizerState>(
    organizerReducer,
    organizerInitialState,
    organizerSagas
);

ReactDOM.render(
    <EnvValidator schema={OrganizerAppEnvSchema}>
        <Provider store={store}>
            <ConnectedRouter history={history}>
                <ThemeProvider theme={customThemes['t721']}>
                    <GlobalStyles />
                    <BrowserRouter>
                        <ScrollToTop>
                            <App />
                        </ScrollToTop>
                    </BrowserRouter>
                </ThemeProvider>
            </ConnectedRouter>
        </Provider>
    </EnvValidator>,
    document.getElementById('root')
);

serviceWorker.register();
