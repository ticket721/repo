import { PasswordlessUserDto } from '@app/server/authentication/dto/PasswordlessUser.dto';

/**
 * Data model returned when fetching user info
 */
export class UsersMeResponseDto {
    /**
     * User info
     */
    user: PasswordlessUserDto;
}
