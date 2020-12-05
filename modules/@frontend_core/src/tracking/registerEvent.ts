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

export const event = (category: string, action: string, label: string, value?: any) => {
    console.log(category, action, label, value);
    gaEvent(category, action, label, value);
};
