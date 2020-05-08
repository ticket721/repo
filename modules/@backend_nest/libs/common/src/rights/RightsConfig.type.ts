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

    /**
     * Means that the current right also counts like the provided list of other rights
     */
    countAs?: string[];
}

/**
 * Rights Config, map containing rights by names
 */
export interface RightsConfig {
    [key: string]: Right;
}
