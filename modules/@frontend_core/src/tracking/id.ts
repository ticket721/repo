import ReactGA from 'react-ga';
import { getEnv } from '../utils/getEnv';

const gaOnId = (_id: string) => {
    if (getEnv().REACT_APP_GA_ID) {
        ReactGA.set({ userId: _id });
    }
};

const segmentOnId = (_id: string, email: string) => {
    if (getEnv().REACT_APP_SEGMENT_API_KEY && !!(window as any).analytics) {
        (window as any).analytics.identify(_id, {
            email,
        });
    }
};

export const onId = (_id: string, email: string) => {
    gaOnId(_id);
    segmentOnId(_id, email);
};
