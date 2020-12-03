import ReactGA from 'react-ga';
import { getEnv } from '../utils/getEnv';

const gaOnId = (_id: string) => {
    if (getEnv().REACT_APP_GA_ID) {
        ReactGA.set({ userId: _id });
    }
};

export const onId = (_id: string) => {
    gaOnId(_id);
};
