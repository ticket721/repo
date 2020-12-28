import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

/**
 * Input when authenticating with google account
 */
export class GoogleLoginInputDto {
    /**
     * Google Auth Code
     */
    @ApiProperty({
        description: 'Google auth code',
    })
    @IsString()
    idToken: string;
}
