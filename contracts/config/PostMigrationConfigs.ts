import { array, constant, Decoder, dict, object, oneOf, string } from '@mojotech/json-type-validation';

/**
 * PostMigration module to run etherscan verification after deployment
 */
export interface EtherscanVerifyAction {
    type: 'etherscan_verify';

    /**
     * Etherscan API key
     */
    api_key: string;

    /**
     * Array of contracts to verify per contracts modules
     *
     * @example
     * ```
     * {
     *     "daiplus": [
     *          "DaiPlus"
     *     ]
     * }
     * ```
     */
    contracts_to_verify: {
        [key: string]: string[]
    }
}

/**
 * TypeGuard instance to check provided JSON configs.
 */
const EtherscanVerifyActionGuard: Decoder<EtherscanVerifyAction> = object({
    type: constant('etherscan_verify'),
    api_key: string(),
    contracts_to_verify: dict(array(string()))
});

export type PostMigrationConfigType = EtherscanVerifyAction;

export type PostMigrationConfigs = PostMigrationConfigType[];

/**
 * TypeGuard instance to check provided JSON configs.
 */
export const PostMigrationConfigGuard: Decoder<PostMigrationConfigs> = array(
    oneOf<EtherscanVerifyAction>(EtherscanVerifyActionGuard)
);
