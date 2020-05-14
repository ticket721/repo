import { constant, Decoder, number, object, oneOf, optional, string } from '@mojotech/json-type-validation';

/**
 * Configuration for the HttpProvider deployment mode.
 * Basically, this works only on local testnets that have accounts
 * already unlocked.
 */
export interface HttpProviderConfig {
    type: 'http' | 'hdwallet' | 'ledger';
}

/**
 * Configuration for the HDWalletProvider deployment mode.
 * This configuration is required when deploying to live
 * networks. It can unlocks accounts from a certain mnemonic.
 */
export interface HDWalletProviderConfig {
    type: 'http' | 'hdwallet' | 'ledger';

    /**
     * Mnemonic tu use to recover the account(s)
     */
    mnemonic: string;

    /**
     * Index of the account to use as the coinbase account
     */
    account_index?: number;

    /**
     * Amount of accounts to unlock
     */
    account_number?: number;

    /**
     * Specify a custom derivation path if required
     */
    derivation_path?: string;
}

/**
 * Configuration for the HDWalletProvider deployment mode.
 * This configuration is required when deploying to live
 * networks. It can unlocks accounts from a certain mnemonic.
 */
export interface LedgerProviderConfig {
    type: 'http' | 'hdwallet' | 'ledger';

    /**
     * Specify a custom derivation path if required
     */
    derivation_path?: string;
}

/**
 * TypeGuard instance to check provided JSON configs.
 */
export const HttpProviderGuard: Decoder<HttpProviderConfig> = object({
    type: oneOf(constant('http'), constant('hdwallet'), constant('ledger'))
});

/**
 * TypeGuard instance to check provided JSON configs.
 */
export const HDWalletProviderGuard: Decoder<HDWalletProviderConfig> = object({
    type: oneOf(constant('http'), constant('hdwallet'), constant('ledger')),
    mnemonic: string(),
    accounts: number(),
    account_index: optional(number()),
    account_number: optional(number()),
    derivation_path: optional(string())
});

/**
 * TypeGuard instance to check provided JSON configs.
 */
export const LedgerProviderGuard: Decoder<LedgerProviderConfig> = object({
    type: oneOf(constant('http'), constant('hdwallet'), constant('ledger')),
    derivation_path: optional(string())
});


