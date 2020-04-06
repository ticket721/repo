/**
 * Express Cassandra Arrays Are Garbage. Takes the stupidely formatted array result and returns a better array, like just a normal one
 * @param value
 * @constructor
 */
export const ECAAG = <T>(value: any): T[] => {
    if (value === null || value === undefined) {
        return [];
    }

    if (!Array.isArray(value)) {
        return [value];
    }

    return value;
};
