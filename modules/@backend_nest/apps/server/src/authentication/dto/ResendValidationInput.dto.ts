import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * Data model returned by the resend validation route
 */
export class ResendValidationInputDto {
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
