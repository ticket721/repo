import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '@lib/common/users/dto/User.dto';

/**
 * Response when reseting password
 */
export class EmailResetPasswordResponseDto {
    /**
     * Error if any
     */
    @ApiProperty()
    user: UserDto;
}
