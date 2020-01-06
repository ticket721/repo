/**
 * Input format when registering a used token for a web3 account
 */
export class RegisterWeb3TokenServiceInputDto {
    /**
     * Token creation timestamp
     */
    timestamp: number;

    /**
     * Signing address
     */
    address: string;
}
