import React                               from 'react';
import ReactDOM                              from 'react-dom';
import './index.css';
import App                                   from './App';
import * as serviceWorker                    from './serviceWorker';
import {Provider}                            from 'react-redux';
import {Store}                               from 'redux';
import { AppState, configureStore, history } from '@frontend/core/lib/redux';
import {BrowserRouter}                       from 'react-router-dom';
import { ConnectedRouter }                   from 'connected-react-router';
import { ThemeProvider }                     from 'styled-components';
import { ScrollToTop }                       from '@frontend/core/lib/components';
import { GlobalStyles }                      from '@frontend/flib-react/lib/shared';
import { customThemes }                      from '@frontend/flib-react/lib/config/theme';

const store: Store<AppState> = configureStore();

ReactDOM.render(
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <GlobalStyles />
            <ThemeProvider theme={customThemes['t721']}>
                <BrowserRouter>
                    <ScrollToTop>
                        <App />
                    </ScrollToTop>
                </BrowserRouter>
            </ThemeProvider>
        </ConnectedRouter>
    </Provider>, document.getElementById('root')
);

serviceWorker.register();
