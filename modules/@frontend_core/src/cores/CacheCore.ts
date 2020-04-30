import { keccak256 }                 from '@common/global';
import { CacheSettings, CacheState } from '../redux/ducks/cache';
import { default as get }            from 'lodash.get';
import { T721SDK }                   from '@common/sdk';

export type SDKCall = InstanceType<typeof T721SDK>;

export abstract class CacheCore {

    /**
     * @return key as a hash of {route, args}
     * @param method
     * @param args
     */
    public static key = (method: string, args: any): string => {
        if (!get(global.window.t721Sdk, method, undefined)) {
            throw Error(`Specified method: ${method} does not correspond to any T721 SDK method`);
        }

        return keccak256(
            JSON.stringify({
                method,
                args,
            })
        );
    };

    /**
     * @return elapsed ticks since start of the application
     * @param cacheSettings
     */
    public static elapsedTicks = (cacheSettings: CacheSettings): number =>
        Math.floor((
            Date.now() - cacheSettings.startTimestamp
        ) / cacheSettings.tickInterval);

    /**
     * Evaluate if request with specified key should be fetched
     * @param cache
     * @param key
     */
    public static shouldFetch = (cache: CacheState, key: string): boolean => {
        // If there is no mounted component that need specified request => don't fetch
        if (
            cache.properties[key].mountedBy === null
            || cache.properties[key].mountedBy.length === 0
        ) {
            return false;
        }

        const filteredRates = cache.properties[key].refreshRates.filter(
            (rate: number) => rate !== null && rate > 0
        );

        // If refreshRates has default value 0 or null and already fetched => don't fetch
        if (filteredRates.length === 0 && cache.properties[key].lastFetch) {
            return false;
        }

        // If lastRep is older than lastFectch or null => don't fetch
        if (cache.properties[key].lastResp < cache.properties[key].lastFetch) {
            return false;
        }

        // If now - lastResp is greater or equal to refreshRate or lastFetch is null/undefined => fetch
        return (
            CacheCore.elapsedTicks(cache.settings) - cache.properties[key].lastResp
            >= Math.min(...filteredRates)
            || !cache.properties[key].lastFetch
        );
    };

    /**
     * Check if specified route exists and execute request
     * @param method
     * @param args
     */
    public static fetchItem = async ( method: any, args: any): Promise<any> => {
        const sdkMethod = get(global.window.t721Sdk, method, undefined);

        if (!sdkMethod) {
            throw Error(`Specified method: ${method} does not correspond to any T721 SDK method`);
        }

        try {
            return await sdkMethod(...args);
        } catch(e) {
            console.log('bad arguments');
            throw e;
        }
    };
}
