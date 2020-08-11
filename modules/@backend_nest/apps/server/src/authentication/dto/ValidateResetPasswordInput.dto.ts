import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

/**
 * Input when reseting password
 */
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
    @ApiProperty({
        description: 'New user password',
    })
    @IsString()
    password: string;
}
