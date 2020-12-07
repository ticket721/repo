import ReactGA from 'react-ga';
import { getEnv } from '../utils/getEnv';

const gaEvent = (category: string, action: string, label: string, value?: any) => {
    if (getEnv().REACT_APP_GA_ID) {
        ReactGA.event({
            category,
            action,
            label,
        });
    }
};

const segmentEvent = (category: string, action: string, label: string, value?: any) => {
    if (getEnv().REACT_APP_SEGMENT_API_KEY && !!(window as any).analytics) {
        (window as any).analytics.track(action, {
            category,
            label,
            value,
        });
    }
};

export const event = (category: string, action: string, label: string, value?: any) => {
    gaEvent(category, action, label, value);
    segmentEvent(category, action, label, value);
};
