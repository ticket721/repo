import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsUrl } from 'class-validator';

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
    @IsEmail()
    email: string;

    /**
     * Redirection url of the validation email
     */
    @ApiPropertyOptional({
        description: 'Url on which user is redirected for verification',
    })
    @IsUrl()
    @IsOptional()
    redirectUrl?: string;
}
