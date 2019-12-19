import { PasswordlessUserDto } from './PasswordlessUser.dto';

/**
 * Response after local account creation
 */
export class LocalRegisterResponseDto {
    /**
     * New account information
     */
    user: PasswordlessUserDto;

    /**
     * JWT Token for further authentication
     */
    token: string;
}
