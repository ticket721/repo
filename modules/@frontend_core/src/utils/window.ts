import { AppState } from '../redux/ducks';
import { Store } from 'redux';
import { T721SDK } from '@common/sdk';

export {};

interface Window {
    t721Sdk?: T721SDK;
    web3?: any;
    ethereum?: any;
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: any;
    __T721_REDUX_STORE__?: Store<AppState>;
}

declare global {
    namespace NodeJS {
        interface Global {
            window: Window;
        }
    }
}
