import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

/**
 * Input for reset password
 */
export class ResetPasswordInputDto {
    /**
     * User information
     */
    @ApiProperty({
        description: 'Reset password Email',
    })
    @IsString()
    email: string;
}
