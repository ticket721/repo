import Joi from '@hapi/joi';

/**
 * Result type of checks runner
 */
export interface ChecksResult<Type = any> {
    /**
     * Error, defined field missing or invalid field
     */
    error?: 'error' | 'incomplete';

    /**
     * Defined if error is defined, gives extra info
     */
    error_trace?: any;

    /**
     * Result data after Joi validation
     */
    result: Type;
}

/**
 * Utility to check provided data dynamically for logical errors and missing fields
 *
 * @param data
 * @param joiConfig
 * @param fields
 * @constructor
 */
export function ChecksRunnerUtil<Type = any>(
    data: any,
    joiConfig: Joi.ObjectSchema<Type>,
    fields: string[],
): ChecksResult<Type> {
    // 1. Perform Joi checks

    const { error, value } = joiConfig.validate(data);

    if (error) {
        return {
            result: null,
            error: 'error',
            error_trace: error,
        };
    }

    // 2. Perform Completion checks

    const missing: string[] = [];

    for (const field of fields) {
        if (Object.keys(data).indexOf(field) === -1) {
            missing.push(field);
        }
    }

    if (missing.length) {
        return {
            result: null,
            error: 'incomplete',
            error_trace: missing,
        };
    }

    return {
        result: value,
    };
}
