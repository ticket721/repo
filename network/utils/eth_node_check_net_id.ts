const Web3 = require('web3');

/**
 * Utility to check if given node has expected network id.
 *
 * @param host
 * @param port
 * @param protocol
 * @param expected_net_id
 */
export async function eth_node_check_net_id(host: string, port: number, protocol: string, expected_net_id: number): Promise<void> {
    const web3 = new Web3(new Web3.providers.HttpProvider(`${protocol}://${host}:${port}`));

    const net_id = await web3.eth.net.getId();

    if (net_id !== expected_net_id) {
        throw new Error(`Invalid network id from node: got ${net_id}, expected ${expected_net_id}`)
    }

}
