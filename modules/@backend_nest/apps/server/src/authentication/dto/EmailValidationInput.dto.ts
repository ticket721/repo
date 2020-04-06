import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

/**
 * Input when validating email address with any account
 */
/* istanbul ignore next */
export class EmailValidationInputDto {
    /**
     * User Email
     */
    @ApiProperty({
        description: 'Secret token proving email ownership',
    })
    @IsString()
    token: string;
}
