import Web3 from 'web3';

const getHeaders = (): any => {
    console.log(process.env.REACT_APP_ETHEREUM_HEADERS);
    if (!process.env.REACT_APP_ETHEREUM_HEADERS) return undefined;

    const headers = JSON.parse(process.env.REACT_APP_ETHEREUM_HEADERS);
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
    const nodeUrl = `${process.env.REACT_APP_ETHEREUM_ENDPOINT_PROTOCOL}://${process.env.REACT_APP_ETHEREUM_ENDPOINT_HOST}:${process.env.REACT_APP_ETHEREUM_ENDPOINT_PORT}`;

    return new Web3(
        new Web3.providers.HttpProvider(nodeUrl, {
            headers: getHeaders(),
        }),
    );
}
