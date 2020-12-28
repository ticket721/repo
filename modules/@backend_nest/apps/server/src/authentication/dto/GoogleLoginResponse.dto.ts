import { PasswordlessUserDto } from './PasswordlessUser.dto';

/**
 * Response upon google authentication
 */
export class GoogleLoginResponseDto {
    /**
     * User data
     */
    user: PasswordlessUserDto;

    /**
     * JWT Token to use for further authentication
     */
    token: string;

    /**
     * Token expiration
     */
    expiration: Date;
}
