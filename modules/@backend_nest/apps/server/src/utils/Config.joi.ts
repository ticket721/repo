import * as Joi from '@hapi/joi';

/**
 * Configuration for apps/server
 */
export const Config: Joi.ObjectSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test', 'test-e2e', 'provision')
        .default('development'),

    MASTER: Joi.boolean().required(),

    API_PORT: Joi.number().default(3000),
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
    ETHEREUM_NODE_HEADERS: Joi.string().optional(),
    ETHEREUM_NODE_PATH: Joi.string().optional(),

    TXS_BLOCK_THRESHOLD: Joi.number().required(),
    TXS_BLOCK_POLLING_REFRESH_RATE: Joi.number().required(),
    TXS_TARGET_GAS_PRICE: Joi.number().required(),
    TXS_GAS_LIMIT: Joi.number().required(),

    TICKETFORGE_SCOPE: Joi.string().required(),

    CONTRACTS_ARTIFACTS_PATH: Joi.string().required(),

    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRATION: Joi.string().default('24h'),
    BCRYPT_SALT_ROUNDS: Joi.number().default(9),

    BULL_REDIS_HOST: Joi.string().required(),
    BULL_REDIS_PORT: Joi.number().required(),

    AUTH_SIGNATURE_TIMEOUT: Joi.number().default(30),

    DOSOJIN_STRIPE_PRIVATE_KEY: Joi.string().required(),

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

    IMAGE_SERVE_DIRECTORY: Joi.string().required().when('NODE_ENV', {
        is: 'production',
        then: Joi.optional(),
        otherwise: Joi.required(),
    }),
    IMAGE_SERVE_PREFIX: Joi.string().required().when('NODE_ENV', {
        is: 'production',
        then: Joi.optional(),
        otherwise: Joi.required(),
    }),
    IMAGE_S3_REGION: Joi.string().required().when('NODE_ENV', {
        is: 'production',
        then: Joi.required(),
        otherwise: Joi.optional(),
    }),
    IMAGE_S3_ACCESS_KEY_ID: Joi.string().required().when('NODE_ENV', {
        is: 'production',
        then: Joi.required(),
        otherwise: Joi.optional(),
    }),
    IMAGE_S3_SECRET_ACCESS_KEY: Joi.string().required().when('NODE_ENV', {
        is: 'production',
        then: Joi.required(),
        otherwise: Joi.optional(),
    }),
    IMAGE_S3_BUCKET_NAME: Joi.string().required().when('NODE_ENV', {
        is: 'production',
        then: Joi.required(),
        otherwise: Joi.optional(),
    }),

    GLOBAL_CONFIG_BLOCK_NUMBER_FETCHING_RATE: Joi.number().required(),
    GLOBAL_CONFIG_ETHEREUM_PRICE_FETCHING_RATE: Joi.number().required(),
    GLOBAL_CONFIG_BINANCE_MOCK: Joi.boolean().default('true'),

    CART_MAX_TICKET_PER_CART: Joi.number().required(),

    ROCKSIDE_OPTS_BASE_URL: Joi.string().required(),
    ROCKSIDE_OPTS_API_KEY: Joi.string().required(),
    ROCKSIDE_OPTS_NETWORK_ID: Joi.number().required(),
    ROCKSIDE_OPTS_NETWORK_NAME: Joi.string().required(),
    ROCKSIDE_FORWARDER_ADDRESS: Joi.string().required(),

    ROCKSIDE_MOCK_OPTS_ORCHESTRATOR_PRIVATE_KEY: Joi.string().when('NODE_ENV', {
        is: 'development',
        then: Joi.required(),
        otherwise: Joi.optional(),
    }),

    MINTER_INDEX: Joi.string().required(),

    FEATURE_FLAGS_CONFIG: Joi.string().optional(),
});
