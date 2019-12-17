import { IsEmail, IsUUID } from 'class-validator';

/**
 * Complete User data type
 */
export class UserDto {
    /**
     * Unique identifier
     */
    @IsUUID()
    id: string;

    /**
     * Unique email
     */
    @IsEmail()
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
