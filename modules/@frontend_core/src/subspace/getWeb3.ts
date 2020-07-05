import Web3 from 'web3';
import { getEnv } from '../utils/getEnv';

const getHeaders = (): any => {
    if (!getEnv().REACT_APP_ETHEREUM_HEADERS) return undefined;

    const headers = JSON.parse(getEnv().REACT_APP_ETHEREUM_HEADERS);
    const ret = [];

    for (const key of Object.keys(headers)) {
        ret.push({
            name: key,
            value: headers[key],
        });
    }

    return ret;
};

export function getWeb3(): Web3 {
    return new Web3(
        new Web3.providers.HttpProvider(getEnv().REACT_APP_ETHEREUM_URL, {
            headers: getHeaders(),
        }),
    );
}
