import ReactGA from 'react-ga';
import { getEnv } from '../utils/getEnv';

const gaEvent = (category: string, variable: string, value: number, label?: string) => {
    if (getEnv().REACT_APP_GA_ID) {
        ReactGA.timing({
            category,
            label,
            variable,
            value,
        });
    }
};

export const timing = (category: string, variable: string, value: number, label?: string) => {
    gaEvent(category, variable, value, label);
};
