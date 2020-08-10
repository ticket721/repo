import { array, constant, Decoder, number, object, oneOf, optional, string } from '@mojotech/json-type-validation';

import { GanacheConfig, GanacheConfigGuard } from './GanacheConfig';
import { GethConfig, GethConfigGuard }       from './GethConfig';
import { RemoteConfig, RemoteConfigGuard }   from './RemoteConfig';

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
     * Extra path if endpoint is not on root
     */
    path?: string;

    /**
     * Communication procotol
     */
    protocol: 'http' | 'https' | 'ws' | 'wss';

    connector: 'http' | 'ws';

    /**
     * Network ID of the node
     */
    network_id: number;

    headers: {
        name: string;
        value: string;
    }[]

    /**
     * In-depth configuration depending on provided `type`
     */
    config: GanacheConfig | GethConfig | RemoteConfig;

    /**
     * Gas price to use in the ganache config
     */
    gas_price?: string;
}

/**
 * TypeGuard instance to check provided JSON configs.
 */
export const NetworkConfigGuard: Decoder<NetworkConfig> = object({
    config: oneOf<GanacheConfig | GethConfig | RemoteConfig>(GanacheConfigGuard, GethConfigGuard, RemoteConfigGuard),
    type: oneOf(constant('ganache'), constant('geth'), constant('remote')),
    protocol: oneOf(constant('http'), constant('https'), constant('ws'), constant('wss')),
    connector: oneOf(constant('http'), constant('ws')),
    host: string(),
    port: number(),
    path: optional(string()),
    network_id: number(),
    headers: array(object({
        name: string(),
        value: string(),
    })),
    gas_price: optional(string())
});
