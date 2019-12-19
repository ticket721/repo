/**
 * Complete User data type
 */
export class UserDto {
    /**
     * Unique identifier
     */
    id: string;

    /**
     * Unique email
     */
    email: string;

    /**
     * Unique username
     */
    username: string;

    /**
     * Keccak256 hash of the pure password
     */
    password: string;

    /**
     * Account type
     */
    type: 't721' | 'web3';

    /**
     * Encrypted wallet
     */
    wallet: string;

    /**
     * Address of the account
     */
    address: string;

    /**
     * Account role
     */
    role: 'authenticated' | 'admin';
}
