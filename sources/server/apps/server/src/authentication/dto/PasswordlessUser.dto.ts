import { IsEmail, IsUUID } from 'class-validator';

/**
 * User information without the password hash
 */
export class PasswordlessUserDto {
    /**
     * Unique identifier of the user
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
     * Type of the account
     */
    type: 't721' | 'web3';

    /**
     * Stored encrypted wallet
     */
    wallet: string;

    /**
     * Address of the account
     */
    address: string;

    /**
     * Role of the account
     */
    role: 'authenticated' | 'admin';
}
