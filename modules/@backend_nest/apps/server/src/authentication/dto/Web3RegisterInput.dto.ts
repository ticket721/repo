import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

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
    @IsString()
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

    /**
     * User Locale
     */
    @ApiPropertyOptional()
    @IsIn(['en', 'fr'])
    @IsOptional()
    locale?: string = 'en';
}
