import React, { Suspense, useEffect, useState } from 'react';
import ReactDOM                                 from 'react-dom';
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
import { deviceWalletInitialState, DeviceWalletReducer, deviceWalletSaga } from './redux/ducks/device_wallet';
import MediaQuery                                                          from 'react-responsive';
import styled                                                              from 'styled-components';
import phone                                                               from './phone.png';
import { FullPageLoading, Icon }                                           from '@frontend/flib-react/lib/components';
import { useTranslation }                                                  from 'react-i18next';
import { splashSaga }                                                      from './redux/ducks/splash/sagas';

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

function useWindowSize() {

    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {

        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);

    }, []);
    return windowSize;

}

interface ScaleOffsetProps {
    scale: number;
    offsetX: number;
    offsetY: number;
    loaded: boolean;
    marginRight: number;
}

const Inception = styled.iframe<ScaleOffsetProps>`
  transform: scale(${props => props.scale});
  transform-origin: bottom right;
  position: absolute;
  margin: 0;
  bottom: ${props => props.offsetY}px;
  right: ${props => props.offsetX}px;
  margin-right: ${props => props.marginRight}px;
  opacity: ${props => props.loaded ? '1' : '0'};
`;

const Loading = styled.div<ScaleOffsetProps>`
  transform: scale(${props => props.scale});
  transform-origin: bottom right;
  position: absolute;
  margin: 0;
  bottom: ${props => props.offsetY}px;
  right: ${props => props.offsetX}px;
  margin-right: ${props => props.marginRight}px;
  opacity: ${props => props.loaded ? '0' : 1};
  display: flex;
  text-align: center;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 334px;
  height: 662px;
  background-color: ${props => props.theme.darkBg};
`;

const LoadingIcon = styled(Icon)`
@keyframes rotating {
  from {
    -ms-transform: rotate(0deg);
    -moz-transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
    -o-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  to {
    -ms-transform: rotate(360deg);
    -moz-transform: rotate(360deg);
    -webkit-transform: rotate(360deg);
    -o-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

  animation: rotating 1s ease-in-out infinite;
`;

const LoadingText = styled.p`
  font-family: 'Gordita', Arial, Helvetica, sans-serif;
  color: ${props => props.theme.textColor};
  font-size: 18px;
`

interface ScaleProps {
    scale: number;
    marginRight: number;
}

const Phone = styled.img<ScaleProps>`
  transform: scale(${props => props.scale});
  transform-origin: bottom right;
  position: absolute;
  bottom: 0;
  right: 0;
  margin-right: ${props => props.marginRight}px;
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
  font-size: 20px;
  opacity: 0.6;
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

    const [loaded, setLoaded] = useState(false);
    const [rendered, setRendered] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setLoaded(true);
        }, 2500);
    }, []);

    useEffect(() => {
        setTimeout(() => {
            setRendered(true);
        }, 2000);
    }, []);

    const [t] = useTranslation('handphone')
    const size = useWindowSize();
    const scale = size.height * 0.9 / 894;
    const offsetX = 183 * scale;
    const offsetY = 194 * scale;
    const marginRight = Math.floor((size.width - (598 * scale)) / 2);

    return <>
        <HandPhoneGlobalStyled/>
        <ThemeProvider theme={customThemes['t721']}>
            <T721Icon icon={'t721'} size={'60px'} color={'#fff'}/>
            <div
                style={{
                    height: '100vh',
                    width: marginRight,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    flexDirection: 'column'
                }}
            >
                <Explanation>{t('use_this')}</Explanation>
                <Warning>{t('warning')}</Warning>
            </div>
            <Phone
                scale={scale}
                src={phone}
                marginRight={marginRight}
                width={598}
            />
            {
                loaded

                    ?
                    null

                    :
                    <Loading
                        loaded={loaded}
                        marginRight={marginRight}
                        scale={scale}
                        offsetX={offsetX}
                        offsetY={offsetY}
                    >
                        <LoadingIcon icon={'loader'} size={'50px'} color={'white'}/>
                        <LoadingText>{t('loading_simulator')}</LoadingText>
                    </Loading>
            }
            {
                rendered

                    ?
                    <Inception
                        loaded={loaded}
                        marginRight={marginRight}
                        scale={scale}
                        offsetX={offsetX}
                        offsetY={offsetY}
                        src={`${window.location.href}`}
                        seamless
                        width={334}
                        height={662}
                        frameBorder={0}
                    />

                    :
                    null
            }
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
