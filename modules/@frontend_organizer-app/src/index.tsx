import React, { PropsWithChildren, useEffect } from 'react';
import ReactDOM                                from 'react-dom';
import './index.css';
import App                                   from './App';
import * as serviceWorker                    from './serviceWorker';
import {Provider}                            from 'react-redux';
import {Store}                               from 'redux';
import { AppState, configureStore, history }   from '@frontend/core/lib/redux';
import {BrowserRouter}           from 'react-router-dom';
import { ConnectedRouter }       from 'connected-react-router';
import { ThemeProvider }         from 'styled-components';
import { ScrollToTop }           from '@frontend/core/lib/components';
import { GlobalStyles }          from '@frontend/flib-react/lib/shared';
import { customThemes }          from '@frontend/flib-react/lib/config/theme';
import { EnvValidator }          from '@frontend/core/lib/components/EnvValidator';
import { OrganizerAppEnvSchema } from './utils/env';
import './locales';
import { init }                  from '@frontend/core/lib/tracking/init';
import { useHistory }            from 'react-router';
import { pageview }              from '@frontend/core/lib/tracking/pageview';

export const store: Store<AppState> = configureStore();

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

ReactDOM.render(
    <EnvValidator schema={OrganizerAppEnvSchema}>
        <Provider store={store}>
            <ConnectedRouter history={history}>
                <ThemeProvider theme={customThemes['t721']}>
                    <GlobalStyles />
                    <BrowserRouter>
                        <PageViewTracker>
                            <ScrollToTop>
                                <App />
                            </ScrollToTop>
                        </PageViewTracker>
                    </BrowserRouter>
                </ThemeProvider>
            </ConnectedRouter>
        </Provider>
    </EnvValidator>,
    document.getElementById('root')
);

serviceWorker.register();
