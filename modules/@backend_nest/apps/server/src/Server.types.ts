/**
 * Informations returned by the App Controller
 */
export interface APIInfos {
    /**
     * Current version of the API
     */
    version: string;

    /**
     * Name of the API
     */
    name: string;

    /**
     * Environment name
     */
    env: string;

    /**
     * Hash of the instance
     */
    instanceHash: string;
}
