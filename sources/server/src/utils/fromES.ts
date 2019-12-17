import { ESSearchHit } from './ESSearchReturn';

/**
 * Utility to convert an ES Search hit to data (extract _source)
 *
 * @param es_result
 */
export function fromES<EntityType>(es_result: ESSearchHit<EntityType>): EntityType {
    if (!es_result || !es_result._source) return null;
    return es_result._source;
}
