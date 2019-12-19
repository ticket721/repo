import { ApiProperty }                 from '@nestjs/swagger';
import { IsEmail, IsObject, IsString } from 'class-validator';
import { EncryptedWallet }             from '@ticket721sources/global';

/**
 * Expected input when creating a local account
 */
export class LocalRegisterInputDto {
    /**
     * Unique email to link to account
     */
    @ApiProperty()
    @IsEmail()
    email: string;

    /**
     * Unique username to use
     */
    @ApiProperty()
    @IsString()
    username: string;

    /**
     * Keccak256 hash of the pure password
     */
    @ApiProperty()
    @IsString()
    password: string;

    /**
     * Encrypted Wallet to store
     */
    @ApiProperty()
    @IsObject()
    wallet: EncryptedWallet;
}
