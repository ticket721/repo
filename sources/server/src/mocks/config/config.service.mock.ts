import { EnvConfig } from '../../config/config.service';

/**
 * Mock for ConfigService
 */
export class ConfigServiceMock {

    /**
     * Static env variable to ease edits
     */
    private static envConfig: EnvConfig = {
        NODE_ENV: 'development'
    };

    /**
     * Building without filePath make this utility extract the variables
     * from the environment and not from a file.
     *
     * @param key
     */
    get(key: string): string {
        return ConfigServiceMock.envConfig[key];
    }

    /**
     * Set a value on the static env variable
     *
     * @param key
     * @param value
     */
    static set(key: string, value: string): void {
        ConfigServiceMock.envConfig[key] = value;
    }

    /**
     * Get a value from the static env variable
     *
     * @param key
     */
    static get_static(key: string): string {
        return ConfigServiceMock.envConfig[key];
    }

}

