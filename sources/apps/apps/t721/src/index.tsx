import React                               from 'react';
import ReactDOM                            from 'react-dom';
import './index.css';
import App                                 from './App';
import * as serviceWorker                  from './serviceWorker';
import {Provider}                          from 'react-redux';
import {Store}                             from 'redux';
import {AppState, configureStore, history} from '@libs/redux/store';
import {BrowserRouter}       from 'react-router-dom';
import { ConnectedRouter }                 from 'connected-react-router';
import ScrollToTop                         from '@libs/components/ScrollToTop';
import { GlobalStyle }                     from '@libs/shared/global';
import { ThemeProvider }                   from 'styled-components';

const store: Store<AppState> = configureStore();

const customTheme = {
  name: 'T721',
  buttonRadius: '8px',
  doubleSpacing: '32px',
  primaryColor: '#079CF0',
  primaryColorGradientEnd: '#2143AB',
  regularSpacing: '16px',
  warningColor: '#C91D31'
};

ReactDOM.render(
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <ScrollToTop>
                <GlobalStyle />
                <ThemeProvider theme={customTheme}>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
                </ThemeProvider>
            </ScrollToTop>
        </ConnectedRouter>
    </Provider>, document.getElementById('root'));

serviceWorker.register();
