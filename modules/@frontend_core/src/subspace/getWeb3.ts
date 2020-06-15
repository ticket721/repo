import Web3 from 'web3';

export function getWeb3(): Web3 {
    const nodeUrl = `${process.env.REACT_APP_ETHEREUM_ENDPOINT_PROTOCOL}://${process.env.REACT_APP_ETHEREUM_ENDPOINT_HOST}:${process.env.REACT_APP_ETHEREUM_ENDPOINT_PORT}`;

    return new Web3(new Web3.providers.HttpProvider(nodeUrl));
}
