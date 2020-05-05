import { PasswordlessUserDto } from '@app/server/authentication/dto/PasswordlessUser.dto';

/**
 * Input for reset password
 */
export class ResetPasswordInputDto {
    /**
     * User information
     */
    email: string;
}
