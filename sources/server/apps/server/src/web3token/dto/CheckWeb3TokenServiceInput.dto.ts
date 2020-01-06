/**
 * Input format when checking if a token is already used
 */
export class CheckWeb3TokenServiceInputDto {
    /**
     * Token creation timestamp
     */
    timestamp: number;

    /**
     * Signing address
     */
    address: string;
}
