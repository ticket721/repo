import { AppState } from '../redux/store';
import { Store }    from 'redux';

export {};

interface Window {
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
