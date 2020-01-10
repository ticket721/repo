/**
 * ES Hit type
 */
export interface ESSearchHit<DocumentType> {
    /**
     * Index of the hit
     */
    _index: string;

    /**
     * Type of the hit
     */
    _type: string;

    /**
     * Unique identifier of the hit
     */
    _id: string;

    /**
     * Matching score of the hit
     */
    _score: number;

    /**
     * Source fields of the hit
     */
    _source: DocumentType;
}

/**
 * ES Query type
 */
export interface ESSearchReturn<DocumentType> {
    /**
     * Time of the request
     */
    took: number;

    /**
     * If the request timed out
     */
    timed_out: boolean;

    /**
     * ES Shards informations
     */
    _shards: {
        /**
         * Current total number of shards
         */
        total: number;

        /**
         * Total number of succesful replying shards
         */
        successful: number;

        /**
         * Total number of skipped replying shards
         */
        skipped: number;

        /**
         * Total number of failed replying shards
         */
        failed: number;
    };
    /**
     * Results of the query
     */
    hits: {
        /**
         * Number of hits
         */
        total: number;

        /**
         * Biggest score amongst the hits
         */
        max_score: number;

        /**
         * Array of hits
         */
        hits: ESSearchHit<DocumentType>[];
    };
}
