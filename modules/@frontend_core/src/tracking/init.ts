import ReactGA from 'react-ga';
import { getEnv } from '../utils/getEnv';

const gaInit = () => {
    if (getEnv().REACT_APP_GA_ID) {
        ReactGA.initialize(getEnv().REACT_APP_GA_ID);
    }
};

export const init = () => {
    gaInit();
};
