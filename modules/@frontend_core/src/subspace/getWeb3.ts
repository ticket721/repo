import Web3 from 'web3';
import { getEnv } from '../utils/getEnv';

const getHeaders = (): any => {
    console.log(getEnv().REACT_APP_ETHEREUM_HEADERS);
    if (!getEnv().REACT_APP_ETHEREUM_HEADERS) return undefined;

    const headers = JSON.parse(getEnv().REACT_APP_ETHEREUM_HEADERS);
    const ret = [];

    for (const key of Object.keys(headers)) {
        ret.push({
            name: key,
            value: headers[key],
        });
    }
    console.log(ret);

    return ret;
};

export function getWeb3(): Web3 {
    console.log('url', getEnv().REACT_APP_ETHEREUM_URL);
    return new Web3(
        new Web3.providers.HttpProvider(getEnv().REACT_APP_ETHEREUM_URL, {
            headers: getHeaders(),
        }),
    );
}
