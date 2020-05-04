import { ApiProperty } from '@nestjs/swagger';
import { PasswordlessUserDto } from '@app/server/authentication/dto/PasswordlessUser.dto';

/**
 * Response when reseting password
 */
export class ValidateResetPasswordResponseDto {
    /**
     * User information
     */
    @ApiProperty()
    user: PasswordlessUserDto;
}
