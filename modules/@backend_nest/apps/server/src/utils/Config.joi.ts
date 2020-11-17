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

    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRATION: Joi.string().default('24h'),
    BCRYPT_SALT_ROUNDS: Joi.number().default(9),

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

    IMAGE_SERVE_DIRECTORY: Joi.string()
        .required()
        .when('NODE_ENV', {
            is: 'production',
            then: Joi.optional(),
            otherwise: Joi.required(),
        }),
    IMAGE_SERVE_PREFIX: Joi.string()
        .required()
        .when('NODE_ENV', {
            is: 'production',
            then: Joi.optional(),
            otherwise: Joi.required(),
        }),
    IMAGE_S3_REGION: Joi.string()
        .required()
        .when('NODE_ENV', {
            is: 'production',
            then: Joi.required(),
            otherwise: Joi.optional(),
        }),
    IMAGE_S3_ACCESS_KEY_ID: Joi.string()
        .required()
        .when('NODE_ENV', {
            is: 'production',
            then: Joi.required(),
            otherwise: Joi.optional(),
        }),
    IMAGE_S3_SECRET_ACCESS_KEY: Joi.string()
        .required()
        .when('NODE_ENV', {
            is: 'production',
            then: Joi.required(),
            otherwise: Joi.optional(),
        }),
    IMAGE_S3_BUCKET_NAME: Joi.string()
        .required()
        .when('NODE_ENV', {
            is: 'production',
            then: Joi.required(),
            otherwise: Joi.optional(),
        }),

    APPLE_PAY_DOMAINS: Joi.string().required(),

    FEATURE_FLAGS_CONFIG: Joi.string().optional(),
});
