import React, { Suspense } from 'react';
import ReactDOM            from 'react-dom';
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
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { ScrollToTop }                      from '@frontend/core/lib/components';
import { GlobalStyles }                                                    from '@frontend/flib-react/lib/shared';
import { customThemes }                                                    from '@frontend/flib-react/lib/config/theme';
import { EnvValidator }                                                    from '@frontend/core/lib/components/EnvValidator';
import { T721AppEnvSchema }                                                from './utils/env';
import MobileApp                                                           from './MobileApp';
import { LocationReducer, locationInitialState, locationSaga }             from './redux/ducks/location';
import { T721AppState }                                                    from './redux';
import { searchInitialState, SearchReducer }                               from './redux/ducks/search';
import { cartInitialState, CartReducer, cartSaga }                         from './redux/ducks/cart';
import { deviceWalletInitialState, DeviceWalletReducer, deviceWalletSaga } from './redux/ducks/device_wallet';
import MediaQuery                                                          from 'react-responsive';
import { getEnv }                                                          from '@frontend/core/lib/utils/getEnv';
import styled                                                              from 'styled-components';
import phone                     from './phone.png';
import { FullPageLoading, Icon } from '@frontend/flib-react/lib/components';
import { useTranslation }        from 'react-i18next';

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

const Inception = styled.iframe`
  position: absolute;
  margin: 0;
  bottom: 196px;
  right: 185px;
  margin-right: 100px;
`;

const Info = styled.p`
  font-family: 'Gordita', Arial, Helvetica, sans-serif;
  font-size: 18px;
  opacity: 0.3;
  font-weight: 100;
  margin: 0;
  margin-left: 100px;
`

const Phone = styled.img`
  position: absolute;
  bottom: 0;
  right: 0;
  margin-right: 100px;
`

const T721Icon = styled(Icon)`
  position: fixed;
  left: 25px;
  top: 25px;
`

const Explanation = styled.h1`
  font-family: 'Gordita', Arial, Helvetica, sans-serif;
  margin: 0;
  margin-left: 100px;
  max-width: 600px;
  font-weight: 200;
`;

const HandPhoneGlobalStyled = createGlobalStyle`
  body {
    margin: 0;
  }
`;

const HandHoldingPhone = () => {

    const [t] = useTranslation('handphone')

    return <>
        <HandPhoneGlobalStyled/>
        <ThemeProvider theme={customThemes['t721']}>
            <T721Icon icon={'t721'} size={'60px'} color={'#fff'}/>
            <div
                style={{
                    height: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    flexDirection: 'column'
                }}
            >
                <Explanation>{t('not_available')}</Explanation>
                <Info>( {t('lend')} )</Info>
            </div>
            <Phone
                src={phone}
                width={598}
            />
            <Inception
                src={`${getEnv().REACT_APP_SELF}${window.location.pathname}`}
                seamless
                width={332}
                height={660}
                frameBorder={0}
            />
        </ThemeProvider>
    </>;
}

const App = () => {

    return <>
        <MediaQuery maxWidth={1224}>
            <EnvValidator schema={T721AppEnvSchema}>
                <Provider store={store}>
                    <ConnectedRouter history={history}>
                        <ThemeProvider theme={customThemes['t721']}>
                            <GlobalStyles/>
                            <BrowserRouter>
                                <ScrollToTop>
                                    <MobileApp/>
                                </ScrollToTop>
                            </BrowserRouter>
                        </ThemeProvider>
                    </ConnectedRouter>
                </Provider>
            </EnvValidator>
        </MediaQuery>
        <MediaQuery minWidth={1224}>
            <Suspense fallback={<FullPageLoading/>}>
                <HandHoldingPhone/>
            </Suspense>
        </MediaQuery>
    </>

}

ReactDOM.render(
    <App/>,
    document.getElementById('root'),
);

serviceWorker.register();
