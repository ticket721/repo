import { PasswordlessUserDto } from './PasswordlessUser.dto';

/**
 * Response after web3 account creation
 */
export class Web3RegisterResponseDto {
    /**
     * New account information
     */
    user: PasswordlessUserDto;

    /**
     * JWT Token for further authentication
     */
    token: string;

    /**
     * JWT Token for email validation. Only returned when NODE_ENV=development
     */
    validationToken?: string;
}
