/**
 * Data model returned on hash query
 */
export class ActionsHashResponseDto {
    /**
     * Resulting hash
     */
    hash: string;

    /**
     * Number of entities that are matching
     */
    count: number;
}
