import ReactGA from 'react-ga';
import { getEnv } from '../utils/getEnv';

const gaModalview = (path: string) => {
    if (getEnv().REACT_APP_GA_ID) {
        ReactGA.modalview(path);
    }
};

const segmentModalview = (path: string) => {
    if (getEnv().REACT_APP_SEGMENT_API_KEY && !!(window as any).analytics) {
        (window as any).analytics.page({
            path: `/modal${path}`,
        });
    }
};

export const modalview = (path: string) => {
    gaModalview(path);
    segmentModalview(path);
};
