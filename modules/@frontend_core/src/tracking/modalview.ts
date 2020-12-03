import ReactGA from 'react-ga';
import { getEnv } from '../utils/getEnv';

const gaModalview = (path: string) => {
    if (getEnv().REACT_APP_GA_ID) {
        ReactGA.modalview(path);
    }
};

export const modalview = (path: string) => {
    gaModalview(path);
};
