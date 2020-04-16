import * as Joi from '@hapi/joi';

/**
 * Configuration for apps/server
 */
export const Config: Joi.ObjectSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test', 'test-e2e', 'provision')
        .default('development'),

    WORKER_PORT: Joi.number().default(3000),
    VALIDATION_URL: Joi.string().required(),
    RESET_PASSWORD_URL: Joi.string().required(),

    CASSANDRA_CONTACT_POINTS: Joi.string().required(),
    CASSANDRA_PORT: Joi.number().required(),

    ELASTICSEARCH_HOST: Joi.string().required(),
    ELASTICSEARCH_PORT: Joi.number().required(),
    ELASTICSEARCH_PROTOCOL: Joi.string().default('http'),

    ETHEREUM_NODE_HOST: Joi.string().required(),
    ETHEREUM_NODE_PORT: Joi.number().required(),
    ETHEREUM_NODE_PROTOCOL: Joi.string().default('http'),
    ETHEREUM_NODE_NETWORK_ID: Joi.number().required(),
    ETHEREUM_MTX_DOMAIN_NAME: Joi.string().required(),
    ETHEREUM_MTX_VERSION: Joi.string().required(),

    TXS_BLOCK_THRESHOLD: Joi.number().required(),
    TXS_BLOCK_POLLING_REFRESH_RATE: Joi.number().required(),
    TXS_TARGET_GAS_PRICE: Joi.number().required(),

    TICKETFORGE_SCOPE: Joi.string().required(),

    CONTRACTS_ARTIFACTS_PATH: Joi.string().required(),

    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRATION: Joi.string().default('24h'),
    BCRYPT_SALT_ROUNDS: Joi.number().default(9),

    BULL_REDIS_HOST: Joi.string().required(),
    BULL_REDIS_PORT: Joi.number().required(),
    BULL_BOARD: Joi.bool().default(false),

    AUTH_SIGNATURE_TIMEOUT: Joi.number().default(30),

    EMAIL_ENGINE: Joi.string()
        .valid('development', 'mailjet')
        .required(),
    EMAIL_TEMPLATE_PATH: Joi.string().required(),

    EMAIL_BROWSER_PREVIEW: Joi.boolean().when('EMAIL_ENGINE', {
        is: 'development',
        then: Joi.required(),
        otherwise: Joi.optional(),
    }),

    MAILJET_API_KEY: Joi.string().when('EMAIL_ENGINE', {
        is: 'mailjet',
        then: Joi.required(),
        otherwise: Joi.optional(),
    }),

    MAILJET_API_SECRET: Joi.string().when('EMAIL_ENGINE', {
        is: 'mailjet',
        then: Joi.required(),
        otherwise: Joi.optional(),
    }),

    IMAGE_MAX_SIZE: Joi.number().required(),
    IMAGE_SERVE_DIRECTORY: Joi.string().required(),

    CURRENCIES_CONFIG_PATH: Joi.string().required(),

    VAULT_HOST: Joi.string().required(),
    VAULT_PORT: Joi.number().required(),
    VAULT_PROTOCOL: Joi.string().default('http'),
    VAULT_TOKEN: Joi.string().required(),

    VAULT_ETHEREUM_NODE_HOST: Joi.string().required(),
    VAULT_ETHEREUM_NODE_PORT: Joi.number().required(),
    VAULT_ETHEREUM_NODE_PROTOCOL: Joi.string().default('http'),
    VAULT_ETHEREUM_NODE_NETWORK_ID: Joi.number().required(),
    VAULT_ETHEREUM_ASSIGNED_ADMIN: Joi.string().required(),

    GLOBAL_CONFIG_BLOCK_NUMBER_FETCHING_RATE: Joi.number().required(),
    GLOBAL_CONFIG_ETHEREUM_PRICE_FETCHING_RATE: Joi.number().required(),
    GLOBAL_CONFIG_BINANCE_MOCK: Joi.boolean().default('true'),

    DOSOJIN_STRIPE_PRIVATE_KEY: Joi.string().required(),
});
