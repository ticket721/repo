import { IsEmail, IsString } from 'class-validator';
import { ApiProperty }       from '@nestjs/swagger';

/**
 * Input format when creating a user with the UserService
 */
export class CreateUserServiceInputDto {
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
     * Encrypted wallet
     */
    @IsString()
    wallet: string;

    /**
     * Address
     */
    @IsString()
    address: string;

    /**
     * Account type
     */
    @IsString()
    type: 't721' | 'web3';

    /**
     * Account role
     */
    role: 'authenticated' | 'admin';
}
