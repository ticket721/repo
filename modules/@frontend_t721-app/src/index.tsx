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

interface ScaleOffsetProps {
    scale: number;
    offsetX: number;
    offsetY: number;
}

const Inception = styled.iframe<ScaleOffsetProps>`
  transform: scale(${props => props.scale});
  transform-origin: bottom right;
  position: absolute;
  margin: 0;
  bottom: ${props => props.offsetY}px;
  right: ${props => props.offsetX}px;
  margin-right: 100px;
`;

const Info = styled.p`
  font-family: 'Gordita', Arial, Helvetica, sans-serif;
  color: ${props => props.theme.textColor};
  font-size: 18px;
  opacity: 0.3;
  font-weight: 100;
  margin: ${props => props.theme.regularSpacing};
  margin-left: 100px;
`

interface ScaleProps {
    scale: number;
}

const Phone = styled.img<ScaleProps>`
  transform: scale(${props => props.scale});
  transform-origin: bottom right;
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
  color: ${props => props.theme.textColor};
  margin: ${props => props.theme.regularSpacing};
  margin-left: 100px;
  max-width: 600px;
  font-weight: 200;
`;

const Warning = styled.h2`
  font-family: 'Gordita', Arial, Helvetica, sans-serif;
  color: ${props => props.theme.textColor};
  margin: ${props => props.theme.regularSpacing};
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
    const scale = window.innerHeight * 0.9 / 894;
    const offsetX = 185 * scale;
    const offsetY = 196 * scale;

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
                <Warning>{t('warning')}</Warning>
                <Info>( {t('lend')} )</Info>
            </div>
            <Phone
                scale={scale}
                src={phone}
                width={598}
            />
            <Inception
                scale={scale}
                offsetX={offsetX}
                offsetY={offsetY}
                src={`${window.location.href}`}
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
