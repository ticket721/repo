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
     * User avatar
     */
    avatar: string;

    /**
     * Keccak256 hash of the pure password
     */
    password: string;

    /**
     * Account type
     */
    type: 't721' | 'web3' | 'google';

    /**
     * Address of the account
     */
    address: string;

    /**
     * Address of the account
     */
    // tslint:disable-next-line:variable-name
    device_address: string;

    /**
     * Account role
     */
    role: 'authenticated' | 'admin';

    /**
     * True if email was verified
     */
    valid: boolean;

    /**
     * True if admin
     */
    admin: boolean;

    /**
     * Locale provided when registered
     */
    locale: string;
}
