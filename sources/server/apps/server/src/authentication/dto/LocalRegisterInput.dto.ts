import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

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
     * User Locale
     */
    @ApiPropertyOptional()
    @IsIn(['en', 'fr'])
    @IsOptional()
    locale?: string = 'en';
}
