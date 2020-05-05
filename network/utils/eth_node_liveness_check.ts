const Web3 = require('web3');
import {header_value_processor} from './header_value_processor';
import { path_processor } from './path_processor.js';

/**
 * Utility to check if node is live and able to process JSON-RPC requests.
 *
 * @param connector
 * @param host
 * @param port
 * @param protocol
 * @param headers
 * @param path
 */
export async function eth_node_liveness_check(connector: string, host: string, port: number, protocol: string, headers: {name: string; value: string;}[], path?: string): Promise<void> {
    let web3;

    switch (connector) {
        case 'http': {
            web3 = new Web3(new Web3.providers.HttpProvider(`${protocol}://${host}:${port}${path_processor(path || '')}`, {headers: header_value_processor(headers)}));
            break ;
        }

        case 'ws': {
            web3 = new Web3(new Web3.providers.WebsocketProvider(`${protocol}://${host}:${port}${(path_processor(path || ''))}`, {headers: header_value_processor(headers)}));
        }
    }

    await web3.eth.net.getId();

    switch (connector) {
        case 'ws': {
            web3.currentProvider.connection.close();
            break ;
        }
    }

}
