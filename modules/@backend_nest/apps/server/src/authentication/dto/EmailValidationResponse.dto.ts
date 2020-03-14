import { ApiProperty } from '@nestjs/swagger';
import { PasswordlessUserDto } from '@app/server/authentication/dto/PasswordlessUser.dto';

/**
 * Response when validating email address with any account
 */
export class EmailValidationResponseDto {
    /**
     * Error if any
     */
    @ApiProperty()
    user: PasswordlessUserDto;
}
