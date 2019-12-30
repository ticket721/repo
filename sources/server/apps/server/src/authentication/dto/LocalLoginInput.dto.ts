import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

/**
 * Input when authenticated with a local account
 */
export class LocalLoginInputDto {
    /**
     * User Email
     */
    @ApiProperty()
    @IsEmail()
    email: string;

    /**
     * Keccak256 hash of pure password
     */
    @ApiProperty()
    @IsString()
    password: string;
}
