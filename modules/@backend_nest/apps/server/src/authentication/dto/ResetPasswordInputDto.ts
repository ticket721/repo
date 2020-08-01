import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

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

    /**
     * Redirection url of the validation email
     */
    @ApiPropertyOptional({
        description: 'Url on which user is redirected for verification',
    })
    @IsString()
    @IsOptional()
    redirectUrl?: string;
}
