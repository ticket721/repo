import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

/**
 * Input when reseting password
 */
/* istanbul ignore next */
export class ValidateResetPasswordInputDto {
    /**
     * Description
     */
    @ApiProperty({
        description: 'User token',
    })
    @IsString()
    token: string;

    /**
     * User Password
     */
    password: string;
}
