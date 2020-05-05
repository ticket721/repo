const Web3 = require('web3');
import { header_value_processor } from './header_value_processor.js';
import { path_processor } from './path_processor.js';

/**
 * Utility to check if given node has expected network id.
 *
 * @param connector
 * @param host
 * @param port
 * @param protocol
 * @param expected_net_id
 * @param headers
 * @param path
 */
export async function eth_node_check_net_id(connector: string, host: string, port: number, protocol: string, expected_net_id: number, headers: { name: string; value: string; }[], path?: string): Promise<void> {
    let web3;

    switch (connector) {
        case 'http': {
            web3 = new Web3(new Web3.providers.HttpProvider(`${protocol}://${host}:${port}${path_processor(path || '')}`, {headers: header_value_processor(headers)}));
            break ;
        }

        case 'ws': {
            web3 = new Web3(new Web3.providers.WebsocketProvider(`${protocol}://${host}:${port}${path_processor(path || '')}`, {headers: header_value_processor(headers)}));
        }
    }

    const net_id = await web3.eth.net.getId();

    if (net_id !== expected_net_id) {
        throw new Error(`Invalid network id from node: got ${net_id}, expected ${expected_net_id}`);
    }

    switch (connector) {
        case 'ws': {
            web3.currentProvider.connection.close();
            break ;
        }
    }

}
