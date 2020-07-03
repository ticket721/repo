import { getEnv } from './getEnv';

export const getImgPath = (id: string): string =>
    // tslint:disable-next-line:max-line-length
    `${getEnv().REACT_APP_T721_SERVER_PROTOCOL}://${getEnv().REACT_APP_T721_SERVER_HOST}:${
        getEnv().REACT_APP_T721_SERVER_PORT
    }/static/${id}`;
