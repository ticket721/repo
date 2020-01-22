import * as Joi from '@hapi/joi';

const AddressLoadConfig: Joi.ObjectSchema = Joi.object({
    address: Joi.string().required(),
    contractName: Joi.string().required(),
});

const ModuleLoadConfig: Joi.ObjectSchema = Joi.object({
    module: Joi.string().required(),
});

const ERC20Currency: Joi.ObjectSchema = Joi.object({
    loadConfig: Joi.object()
        .valid(AddressLoadConfig, ModuleLoadConfig)
        .required(),
});

const NativeCurrency: Joi.ObjectSchema = Joi.object({
    loadConfig: Joi.object()
        .valid(AddressLoadConfig, ModuleLoadConfig)
        .required(),
});

const SetCurrency: Joi.ObjectSchema = Joi.object({
    contains: Joi.array()
        .items(Joi.string())
        .min(1),
});

const Currency: Joi.ObjectSchema = Joi.object({
    name: Joi.string().required(),
    type: Joi.string()
        .valid('erc20', 'native', 'set')
        .required(),
    dollarPeg: Joi.number().optional(),
    infos: Joi.object()
        .valid(ERC20Currency, NativeCurrency, SetCurrency)
        .required(),
});

/**
 * Currencies data structure
 */
export const Currencies: Joi.ArraySchema = Joi.array()
    .items(Currency)
    .required();
