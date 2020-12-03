import ReactGA from 'react-ga';
import { getEnv } from '../utils/getEnv';

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        // tslint:disable-next-line:no-bitwise triple-equals one-variable-per-declaration
        const r = (Math.random() * 16) | 0,
            // tslint:disable-next-line:triple-equals no-bitwise
            v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

const gaInit = () => {
    if (getEnv().REACT_APP_GA_ID) {
        let clientId = localStorage.getItem('gaId');

        if (!clientId) {
            clientId = uuidv4();
            localStorage.setItem('gaId', clientId);
        }

        console.log(`Creating GA instance with id ${getEnv().REACT_APP_GA_ID} and clientId ${clientId}`);
        ReactGA.initialize(getEnv().REACT_APP_GA_ID, {
            gaOptions: {
                storeGac: false,
                clientId,
                storage: 'none',
            },
        });
        ReactGA.ga('set', 'checkProtocolTask', null);
    }
};

export const init = () => {
    gaInit();
};
