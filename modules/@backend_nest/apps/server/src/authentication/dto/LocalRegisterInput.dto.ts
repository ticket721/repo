import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

/**
 * Expected input when creating a local account
 */
export class LocalRegisterInputDto {
    /**
     * Unique email to link to account
     */
    @ApiProperty({
        description: 'User email',
    })
    @IsEmail()
    email: string;

    /**
     * Unique username to use
     */
    @ApiProperty({
        description: 'User username',
    })
    @IsString()
    username: string;

    /**
     * Keccak256 hash of the pure password
     */
    @ApiProperty({
        description: 'User password',
    })
    @IsString()
    password: string;

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
