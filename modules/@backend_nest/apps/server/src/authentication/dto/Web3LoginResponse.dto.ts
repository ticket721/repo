import { PasswordlessUserDto } from './PasswordlessUser.dto';

/**
 * Response upon web3 authentication
 */
export class Web3LoginResponseDto {
    /**
     * User data
     */
    user: PasswordlessUserDto;

    /**
     * JWT Token to use for further authentication
     */
    token: string;

    /**
     * Expiration date of the token
     */
    expiration: Date;
}
