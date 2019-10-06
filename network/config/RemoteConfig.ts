import {Decoder, object, string, number} from '@mojotech/json-type-validation'

/**
 * Interface used to configure Remote networks.
 * As you can see, nothing is required !
 */
export interface RemoteConfig {
}

/**
 * TypeGuard instance to check provided JSON configs.
 */
export const RemoteConfigGuard: Decoder<RemoteConfig> = object({
});

