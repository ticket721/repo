import { PasswordlessUserDto } from './PasswordlessUser.dto';

/**
 * Response after local account creation
 */
export class ResetPasswordResponseDto {
    /**
     * User information
     */
    user: PasswordlessUserDto;

    /**
     * JWT Token for reset password validation. Only returned when NODE_ENV=development
     */
    validationToken?: string;
}
