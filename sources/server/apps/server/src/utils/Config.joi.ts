import * as Joi from '@hapi/joi';

export const Config: Joi.ObjectSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test', 'test-e2e', 'provision')
        .default('development'),

    API_PORT: Joi.number().default(3000),

    CASSANDRA_CONTACT_POINTS: Joi.string().required(),
    CASSANDRA_PORT: Joi.number().required(),

    ELASTICSEARCH_HOST: Joi.string().required(),
    ELASTICSEARCH_PORT: Joi.number().required(),
    ELASTICSEARCH_PROTOCOL: Joi.string().default('http'),

    ETHEREUM_NODE_HOST: Joi.string().required(),
    ETHEREUM_NODE_PORT: Joi.number().required(),
    ETHEREUM_NODE_PROTOCOL: Joi.string().default('http'),

    CONTRACTS_ARTIFACTS_PATH: Joi.string().required(),

    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRATION: Joi.string().default('24h'),
    BCRYPT_SALT_ROUNDS: Joi.number().default(9),

    BULL_REDIS_HOST: Joi.string().required(),
    BULL_REDIS_PORT: Joi.number().required(),
    BULL_BOARD: Joi.bool().default(false),

    AUTH_SIGNATURE_TIMEOUT: Joi.number().default(30),
});
