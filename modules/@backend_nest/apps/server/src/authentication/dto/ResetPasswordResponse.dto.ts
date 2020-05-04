import { PasswordlessUserDto } from './PasswordlessUser.dto';

/**
 * Response after local account creation
 */
export class ResetPasswordResponseDto {
    /**
     * New account information
     */
    user: PasswordlessUserDto;

    /**
     * JWT Token for email validation. Only returned when NODE_ENV=development
     */
    validationToken?: string;
}
