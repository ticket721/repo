import { PasswordlessUserDto } from './PasswordlessUser.dto';

/**
 * Response upon local authentication
 */
export class LocalLoginResponseDto {
    /**
     * User data
     */
    user: PasswordlessUserDto;

    /**
     * JWT Token to use for further authentication
     */
    token: string;
}
