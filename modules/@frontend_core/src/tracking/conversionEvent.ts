import { getEnv } from '../utils/getEnv';

const segmentConversionEvent = (name: string) => {
    if (getEnv().REACT_APP_SEGMENT_API_KEY && !!(window as any).analytics) {
        (window as any).analytics.track(name);
    }
};

export const conversionEvent = (name: string) => {
    segmentConversionEvent(name);
};
