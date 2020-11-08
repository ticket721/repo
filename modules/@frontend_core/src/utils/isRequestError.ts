import { isNil } from 'lodash';
import { RequestBag } from '../hooks/useRequest';
import { getEnv } from '../utils/getEnv';

const THRESHOLD = parseInt(getEnv().REACT_APP_ERROR_THRESHOLD, 10);

export const isRequestError = (req: RequestBag<any>): boolean => {
    // If there is no data in cache + error
    if (!isNil(req.response.error) && isNil(req.response.data)) {
        return true;
    }

    // If we have several error requests one after the other
    return req.response.errors >= THRESHOLD;
};
