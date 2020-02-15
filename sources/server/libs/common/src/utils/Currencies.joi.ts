import * as Joi from '@hapi/joi';

/**
 * Dynamic data checker for the currencies
 */
const Currency: Joi.ObjectSchema = Joi.object({
    name: Joi.string().required(),
    dollarPeg: Joi.number().optional(),
    type: Joi.string()
        .valid('erc20', 'set')
        .required(),
    loadType: Joi.string().valid('module', 'address'),
    contains: Joi.array()
        .items(Joi.string())
        .min(1)
        .when('type', {
            is: 'set',
            then: Joi.required(),
            otherwise: Joi.optional(),
        }),
    moduleName: Joi.string().when('type', {
        is: Joi.string().valid('erc20'),
        then: Joi.required(),
        otherwise: Joi.optional(),
    }),
    contractName: Joi.string().when('type', {
        is: Joi.string().valid('erc20'),
        then: Joi.required(),
        otherwise: Joi.optional(),
    }),
    contractAddress: Joi.string().when('type', {
        is: Joi.string().valid('erc20'),
        then: Joi.when('loadType', {
            is: 'address',
            then: Joi.required(),
            otherwise: Joi.optional(),
        }),
        otherwise: Joi.optional(),
    }),
});

/**
 * Currencies data structure
 */
export const Currencies: Joi.ArraySchema = Joi.array()
    .items(Currency)
    .required();
