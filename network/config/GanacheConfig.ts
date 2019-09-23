import {Decoder, object, string} from '@mojotech/json-type-validation'

/**
 * Interface used to configure new Ganache instances.
 *
 * @example
 * ```
 * {
 *     "mnemonic": "cross uniform panic climb universe awful surprise list dutch ability label cat",
 *     "image": "trufflesuite/ganache-cli",
 *     "version": "v6.3.0",
 *     "container_name": "t721-ethnode",
 *     "gasLimit": "0xffffffffff",
 *     "gasPrice": "0x2540BE400"
 * }
 * ```
 */
export interface GanacheConfig {
    /**
     * The mnemonic (12 word list) that will be used to generated the 10 first accounts.
     * Each account will have 100 test ethers.
     */
    mnemonic: string;

    /**
     * Docker Image name to use for the Ganache container that will be created.
     */
    image: string;

    /**
     * Docker Image version to use for the Ganache container that will be created.
     */
    version: string;

    /**
     * Name given to the created docker container
     */
    container_name: string;

    /**
     * Gas limit per block. Value as Hex String.
     */
    gasLimit: string;

    /**
     * Gas Price. Value as Hex String.
     */
    gasPrice: string;
}

/**
 * TypeGuard instance to check provided JSON configs.
 */
export const GanacheConfigGuard: Decoder<GanacheConfig> = object({
    mnemonic: string(),
    image: string(),
    version: string(),
    container_name: string(),
    gasLimit: string(),
    gasPrice: string()
});
