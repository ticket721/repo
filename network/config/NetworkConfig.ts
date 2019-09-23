import { constant, Decoder, number, object, oneOf, string } from '@mojotech/json-type-validation';

import { GanacheConfig, GanacheConfigGuard } from './GanacheConfig';
import { GethConfig, GethConfigGuard }       from './GethConfig';

/**
 * Configuration required for the network engine module.
 *
 * @example
 * ```
 * {
 *      "type": "ganache",
 *      "host": "127.0.0.1",
 *      "port": 8545,
 *      "protocol": "http",
 *      "network_id": 2702,
 *
 *      "config": {
 *          "mnemonic": "cross uniform panic climb universe awful surprise list dutch ability label cat",
 *          "image": "trufflesuite/ganache-cli",
 *          "version": "v6.3.0",
 *          "container_name": "t721-ethnode",
 *          "gasLimit": "0xffffffffff",
 *          "gasPrice": "0x2540BE400"
 *      }
 *
 * }
 * ```
 */
export interface NetworkConfig {
    /**
     * Network configuration type
     */
    type: 'ganache' | 'geth' | 'remote';

    /**
     * Hostname of the node
     */
    host: string;

    /**
     * JSON-RPC port on the node
     */
    port: number;

    /**
     * Communication procotol
     */
    protocol: 'http' | 'https';

    /**
     * Network ID of the node
     */
    network_id: number;

    /**
     * In-depth configuration depending on provided `type`
     */
    config: GanacheConfig | GethConfig;
}

/**
 * TypeGuard instance to check provided JSON configs.
 */
export const NetworkConfigGuard: Decoder<NetworkConfig> = object({
    config: oneOf<GanacheConfig | GethConfig>(GanacheConfigGuard, GethConfigGuard),
    type: oneOf(constant('ganache'), constant('geth'), constant('remote')),
    protocol: oneOf(constant('http'), constant('https')),
    host: string(),
    port: number(),
    network_id: number(),
});
