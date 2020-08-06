import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

/**
 * Input format when creating a user with the UserService
 */
export class CreateUserServiceInputDto {
    /**
     * Unique Identifier
     */
    @IsString()
    @IsOptional()
    id?: any;

    /**
     * Unique email
     */
    @IsEmail()
    email: string;

    /**
     * Unique unsername
     */
    @IsString()
    username: string;

    /**
     * Keccak256 hash of the pure password
     */
    @IsString()
    password: string;

    /**
     * Address
     */
    @IsString()
    address: string;

    /**
     * Address
     */
    @IsString()
    // tslint:disable-next-line:variable-name
    device_address: string;

    /**
     * Account type
     */
    @IsString()
    type: 't721' | 'web3';

    /**
     * Account role
     */
    @IsString()
    role: 'authenticated' | 'admin';

    /**
     * Locale
     */
    @IsString()
    locale: string;

    /**
     * True if user is admin
     */
    @IsBoolean()
    admin: boolean;
}
