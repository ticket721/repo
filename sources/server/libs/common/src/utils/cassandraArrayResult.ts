/**
 * Utility to convert array types to arrays. Cassandra loves to return single value arrays as object and not arrays ...
 * @param res
 */
export const cassandraArrayResult = <Type>(res: Type | Type[] | undefined): Type[] => {
    if (res === null || res === undefined) {
        return [];
    }

    if (res && !Array.isArray(res)) {
        return [res];
    }

    return res as Type[];
};
