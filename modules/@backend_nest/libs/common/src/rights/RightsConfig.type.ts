/**
 * Single Right
 */
export interface Right {
    /**
     * Maximum count of the right
     */
    count?: number;

    /**
     * Has the ability to edit the rights of others
     */
    can_edit_rights?: boolean;

    /**
     * If set to true, everyone can do it
     */
    public?: boolean;
}

/**
 * Rights Config, map containing rights by names
 */
export interface RightsConfig {
    [key: string]: Right;
}
