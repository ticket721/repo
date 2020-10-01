import { Purchase } from '@lib/common/users/entities/Purchases.type';

/**
 * User information without the password hash
 */
export class PasswordlessUserDto {
    /**
     * Unique identifier of the user
     */
    id: string;

    /**
     * Current purchase process
     */
    // tslint:disable-next-line:variable-name
    current_purchase: Purchase;

    /**
     * Past purchases
     */
    // tslint:disable-next-line:variable-name
    past_purchases: Purchase[];

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
     * Address of the device
     */
    // tslint:disable-next-line:variable-name
    device_address: string;

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

    /**
     * True if admin
     */
    admin: boolean;
}
