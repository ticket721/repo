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
     * Address of the account
     */
    address: string;

    /**
     * Account role
     */
    role: 'authenticated' | 'admin';

    /**
     * True if email was verified
     */
    valid: boolean;

    /**
     * Locale provided when registered
     */
    locale: string;

    /**
     * Stripe customer token
     */
    // tslint:disable-next-line:variable-name
    stripe_customer_token: string;
}
