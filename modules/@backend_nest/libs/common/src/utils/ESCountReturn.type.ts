/**
 * ES Count return type
 */
export interface ESCountReturn {
    count: number;
    _shards: {
        total: number;
        successful: number;
        skipped: number;
        failed: number;
    };
}
