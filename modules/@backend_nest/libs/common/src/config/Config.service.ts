import * as dotenv   from 'dotenv';
import * as Joi      from '@hapi/joi';
import * as fs       from 'fs';
import { NestError } from '@lib/common/utils/NestError';

/**
 * Environment type
 */
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
     * Configuration object
     */
    private readonly joiConfig: Joi.ObjectSchema;

    /**
     * Building without filePath make this utility extract the variables
     * from the environment and not from a file.
     *
     * @param joi
     * @param filePaths
     */
    constructor(joi: Joi.ObjectSchema, filePaths?: string[]) {
        /* istanbul ignore next */
        if (filePaths && filePaths.length) {
            let env = {};
            for (const filePath of filePaths) {
                env = {
                    ...dotenv.parse(fs.readFileSync(filePath)),
                    ...env,
                };
            }
            this.envConfig = env;
        } else {
            this.envConfig = process.env;
        }
        this.joiConfig = joi;
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
        const { error, value: validatedEnvConfig } = this.joiConfig.validate(envConfig);

        if (error) {
            throw new NestError(`Config validation error: ${error.message}`);
        }

        return validatedEnvConfig;
    }
}
