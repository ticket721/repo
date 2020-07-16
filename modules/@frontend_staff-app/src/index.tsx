import React                               from 'react';
import ReactDOM                              from 'react-dom';
import './index.css';
import App                                   from './App';
import * as serviceWorker                    from './serviceWorker';
import {Provider}                                        from 'react-redux';
import {Store}                                           from 'redux';
import { configureStore, history }                       from '@frontend/core/lib/redux';
import {BrowserRouter}                                   from 'react-router-dom';
import { ConnectedRouter }                               from 'connected-react-router';
import { ThemeProvider }                                 from 'styled-components';
import { ScrollToTop }                                   from '@frontend/core/lib/components';
import { GlobalStyles }                                  from '@frontend/flib-react/lib/shared';
import { customThemes }                                  from '@frontend/flib-react/lib/config/theme';
import { StaffAppState }                                 from './redux';
import { currentEventInitialState, CurrentEventReducer } from './redux/ducks/current_event';
import { EnvValidator }                                  from '@frontend/core/lib/components/EnvValidator';
import { StaffAppEnvSchema }                             from './utils/env';
import './locales';
import { currentEventSaga }                              from './redux/ducks/current_event/sagas';

const store: Store<StaffAppState> = configureStore<any>({
    currentEvent: CurrentEventReducer,
}, {
    currentEvent: currentEventInitialState,
}, [currentEventSaga]);

ReactDOM.render(
    <EnvValidator schema={StaffAppEnvSchema}>
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
    </EnvValidator>, document.getElementById('root')
);

serviceWorker.register();
