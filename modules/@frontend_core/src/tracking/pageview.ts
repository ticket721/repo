import ReactGA from 'react-ga';
import { getEnv } from '../utils/getEnv';

const gaPageview = (path: string) => {
    if (getEnv().REACT_APP_GA_ID) {
        ReactGA.pageview(path);
    }
};

const segmentPageview = (path: string) => {
    if (getEnv().REACT_APP_SEGMENT_API_KEY && !!(window as any).analytics) {
        (window as any).analytics.page();
    }
};

export const pageview = (path: string) => {
    gaPageview(path);
    segmentPageview(path);
};
