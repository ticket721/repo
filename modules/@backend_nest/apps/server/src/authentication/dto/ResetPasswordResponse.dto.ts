import { PasswordlessUserDto } from './PasswordlessUser.dto';

/**
 * Response after local account creation
 */
export class ResetPasswordResponseDto {
    /**
     * JWT Token for reset password validation. Only returned when NODE_ENV=development
     */
    validationToken?: string;
}
