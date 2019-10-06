const Web3 = require('web3');

/**
 * Utility to check if node is live and able to process JSON-RPC requests.
 *
 * @param host
 * @param port
 * @param protocol
 * @param path
 */
export async function eth_node_liveness_check(host: string, port: number, protocol: string, path?: string): Promise<void> {
    const web3 = new Web3(new Web3.providers.HttpProvider(`${protocol}://${host}:${port}${path || ''}`));

    await web3.eth.net.getId();

}
