import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

/**
 * Expected input when creating a web3 account
 */
export class Web3RegisterInputDto {
    /**
     * Unique email to link to account
     */
    @ApiProperty({
        description: 'User email',
    })
    @IsEmail()
    email: string;

    /**
     * Expected address after signature verification
     */
    @ApiProperty({
        description: 'User address',
    })
    @IsString()
    address: string;

    /**
     * Unique username to use
     */
    @ApiProperty({
        description: 'User username',
    })
    @IsString()
    username: string;

    /**
     * Timestamp used for the signature. Base 10 format
     */
    @ApiProperty({
        description: 'User timestamp',
    })
    @IsString()
    timestamp: string;

    /**
     * Signature of the Web3Register data type
     */
    @ApiProperty({
        description: 'Address ownership',
    })
    @IsString()
    signature: string;

    /**
     * User Locale
     */
    @ApiPropertyOptional({
        description: 'User locale',
    })
    @IsIn(['en', 'fr'])
    @IsOptional()
    locale?: string = 'en';
}
