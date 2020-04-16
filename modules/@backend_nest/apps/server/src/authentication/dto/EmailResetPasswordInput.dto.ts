import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

/**
 * Input when reseting password
 */
/* istanbul ignore next */
export class EmailResetPasswordInputDto {
    /**
     * User Email
     */
    @ApiProperty({
        description: 'Secret token proving email ownership',
    })
    @IsString()
    token: string;
}
