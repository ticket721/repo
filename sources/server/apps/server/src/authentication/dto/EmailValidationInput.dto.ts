import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

/**
 * Input when validating email address with any account
 */
export class EmailValidationInputDto {
    /**
     * User Email
     */
    @ApiProperty()
    @IsString()
    token: string;
}
