import {Decoder, object, string, number} from '@mojotech/json-type-validation'

/**
 * Interface used to configure new Ganache instances.
 *
 * @example
 * ```
 * {
 *     "mnemonic": "cross uniform panic climb universe awful surprise list dutch ability label cat",
 *     "image": "ticket721/test-geth",
 *     "version": "latest",
 *     "container_name": "t721-ethnode",
 *     "accounts": 10
 * }
 * ```
 */
export interface GethConfig {
    /**
     * The mnemonic (12 word list) that will be used to generated the 10 first accounts.
     * Each account will have 100 test ethers.
     */
    mnemonic: string;

    /**
     * Docker Image name to use for the test Geth container that will be created.
     */
    image: string;

    /**
     * Docker Image version to use for the test Geth container that will be created.
     */
    version: string;

    /**
     * Name given to the created docker container
     */
    container_name: string;

    /**
     * Number of account to create and unlock
     */
    accounts: number;
}

/**
 * TypeGuard instance to check provided JSON configs.
 */
export const GethConfigGuard: Decoder<GethConfig> = object({
    mnemonic: string(),
    image: string(),
    version: string(),
    container_name: string(),
    accounts: number()
});

