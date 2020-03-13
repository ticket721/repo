/**
 * User information without the password hash
 */
export class PasswordlessUserDto {
    /**
     * Unique identifier of the user
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
     * Type of the account
     */
    type: 't721' | 'web3';

    /**
     * Address of the account
     */
    address: string;

    /**
     * Role of the account
     */
    role: 'authenticated' | 'admin';

    /**
     * User locale
     */
    locale: string;

    /**
     * True if email has been validated
     */
    valid: boolean;
}
