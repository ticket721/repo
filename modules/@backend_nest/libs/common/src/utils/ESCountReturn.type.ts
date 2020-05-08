/**
 * ES Count return type
 */
export interface ESCountReturn {
    /**
     * Entity Count
     */
    count: number;

    /**
     * Query info
     */
    _shards: {
        /**
         * Total of requests shared
         */
        total: number;

        /**
         * Total of succesful shards
         */
        successful: number;

        /**
         * Total of skipped shards
         */
        skipped: number;

        /**
         * Total of failed shards
         */
        failed: number;
    };
}
