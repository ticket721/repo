export function fromES<EntityType>(es_result: any): EntityType {
    if (!es_result || !es_result._source) return null;
    return es_result._source;
}
