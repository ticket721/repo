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
     * Position of the API on the replica set
     */
    position: number
}
