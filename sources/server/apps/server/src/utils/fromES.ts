/**
 * Utility to convert an ES Search hit to data (extract _source)
 *
 * @param esResult
 */
import { ESSearchHit } from '@lib/common/utils/ESSearchReturn';

export function fromES<EntityType>(
    esResult: ESSearchHit<EntityType>,
): EntityType {
    if (!esResult || !esResult._source) {
        return null;
    }
    return esResult._source;
}
