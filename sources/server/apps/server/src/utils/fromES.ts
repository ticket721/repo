import { ESSearchHit } from '@lib/common/utils/ESSearchReturn';

/**
 * Utility to convert an ES Search hit to data (extract _source)
 *
 * @param esResult
 */
export function fromES<EntityType>(
    esResult: ESSearchHit<EntityType>,
): EntityType {
    if (!esResult || !esResult._source) {
        return null;
    }
    return esResult._source;
}
