import { ApiProperty }                   from '@nestjs/swagger';
import { IsEmail, IsString, ValidateIf } from 'class-validator';
import { isAddress }                     from '@ticket721sources/global';

/**
 * Expected input when creating a web3 account
 */
export class Web3RegisterInputDto {
    /**
     * Unique email to link to account
     */
    @ApiProperty()
    @IsEmail()
    email: string;

    /**
     * Expected address after signature verification
     */
    @ApiProperty()
    @ValidateIf((addr: string): boolean => isAddress(addr))
    address: string;

    /**
     * Unique username to use
     */
    @ApiProperty()
    @IsString()
    username: string;

    /**
     * Timestamp used for the signature. Base 10 format
     */
    @ApiProperty()
    @IsString()
    timestamp: string;

    /**
     * Signature of the Web3Register data type
     */
    @ApiProperty()
    @IsString()
    signature: string;
}
