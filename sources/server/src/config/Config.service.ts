import * as dotenv from 'dotenv';
import * as Joi    from '@hapi/joi';
import * as fs     from 'fs';

export type EnvConfig = Record<string, string>;

/**
 * Utility to handle the environment configuration
 */
export class ConfigService {
    /**
     * Contains the environment variables exposed to the API
     */
    private readonly envConfig: EnvConfig;

    /**
     * Building without filePath make this utility extract the variables
     * from the environment and not from a file.
     *
     * @param filePath `.env` file
     */
    constructor(filePath?: string) {
        /* istanbul ignore next */
        if (filePath) {
            this.envConfig = dotenv.parse(fs.readFileSync(filePath));
        } else {
            this.envConfig = process.env;
        }
        this.validateInput(this.envConfig);
    }

    /**
     * Building without filePath make this utility extract the variables
     * from the environment and not from a file.
     *
     * @param key
     */
    get(key: string): string {
        return this.envConfig[key];
    }

    /**
     * Utility to validate the environment variables.
     *
     * @param envConfig
     */
    private validateInput(envConfig: EnvConfig): EnvConfig {
        const envVarsSchema: Joi.ObjectSchema = Joi.object({
            NODE_ENV: Joi.string()
                .valid('development', 'production', 'test', 'test-e2e', 'provision')
                .default('development'),

            API_PORT: Joi.number().default(3000),

            CASSANDRA_CONTACT_POINTS: Joi.string().required(),
            CASSANDRA_PORT: Joi.number().required(),

            ELASTICSEARCH_HOST: Joi.string().required(),
            ELASTICSEARCH_PORT: Joi.number().required(),
            ELASTICSEARCH_PROTOCOL: Joi.string().default('http'),

            JWT_SECRET: Joi.string().required(),
            JWT_EXPIRATION: Joi.string().default('24h'),
            BCRYPT_SALT_ROUNDS: Joi.number().default(9)

        });

        const { error, value: validatedEnvConfig } = envVarsSchema.validate(
            envConfig,
        );

        if (error) {
            throw new Error(`Config validation error: ${error.message}`);
        }

        return validatedEnvConfig;
    }
}
