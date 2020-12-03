import ReactGA from 'react-ga';
import { getEnv } from '../utils/getEnv';

const gaPageview = (path: string) => {
    if (getEnv().REACT_APP_GA_ID) {
        ReactGA.pageview(path);
    }
};

export const pageview = (path: string) => {
    gaPageview(path);
};
