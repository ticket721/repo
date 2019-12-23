import * as dotenv  from 'dotenv';
import * as Joi     from '@hapi/joi';
import * as fs      from 'fs';
import { hostname } from 'os';

export type EnvConfig = Record<string, string>;

/**
 * Utility to handle the environment configuration
 */
export class ConfigService {
    /**
     * Contains the environment variables exposed to the API
     */
    private readonly envConfig: EnvConfig;
    private readonly joiConfig: Joi.ObjectSchema;

    /**
     * Building without filePath make this utility extract the variables
     * from the environment and not from a file.
     *
     * @param joi
     * @param filePath `.env` file
     */
    constructor(joi: Joi.ObjectSchema, filePath?: string) {
        /* istanbul ignore next */
        if (filePath) {
            this.envConfig = dotenv.parse(fs.readFileSync(filePath));
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

        const { error, value: validatedEnvConfig } = this.joiConfig.validate(
            envConfig,
        );

        if (error) {
            throw new Error(`Config validation error: ${error.message}`);
        }

        return validatedEnvConfig;
    }

    private numRegExp = /^[0123456789]+$/;

    getRole(): number {
        /* istanbul ignore else */
        if (this.get('NODE_ENV') === 'development') {
            return 0;
        } else {
            if (!this.get('HOSTNAME_PREFIX')) {
                throw new Error(`Config validation error: in NODE_ENV=${this.get('NODE_ENV')}, HOSTNAME_PREFIX are required env vars`)
            }

            const prefix: string = this.get('HOSTNAME_PREFIX');
            const hn: string = hostname();
            if (hn.indexOf(prefix) !== 0) {
                throw new Error(`Invalid HOSTNAME_PREFIX value, cannot be found in real hostname: prefix ${this.get('HOSTNAME_PREFIX')} hostname ${hn}`);
            }

            if (!this.numRegExp.test(hn.slice(prefix.length + 1))) {
                throw new Error(`Invalid hostname configuration: got hostname ${hn}, while expecting something like ${prefix}-ID`);
            }

            return parseInt(hn.slice(prefix.length + 1));

        }
    }
}
