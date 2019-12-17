import { Injectable }          from '@nestjs/common';
import { UsersService }        from '../users/Users.service';
import { PasswordlessUserDto } from './dto/PasswordlessUser.dto';
import { UserDto }             from '../users/dto/User.dto';
import { compare, hash }       from 'bcrypt';
import {
    EncryptedWallet,
    isV3EncryptedWallet,
    toAcceptedAddressFormat,
    isKeccak256
}                              from '@ticket721sources/global';
import { ServiceResponse }     from '../../utils/ServiceResponse';
import { ConfigService }       from '../../config/Config.service';

/**
 * Authentication services and utilities
 */
@Injectable()
export class AuthenticationService {
    /**
     * Dependency Injection
     *
     * @param usersService
     * @param configService
     */
    constructor(
        private readonly usersService: UsersService,
        private readonly configService: ConfigService
    ) {
    }

    /**
     * Utility to verify if any user exists with given email, and if provided
     * password matches.
     *
     * @param email
     * @param password
     */
    async validateUser(email: string, password: string): Promise<ServiceResponse<PasswordlessUserDto>> {
        const resp: ServiceResponse<UserDto> = await this.usersService.findByEmail(email);

        if (resp.error) {
            return resp;
        }

        if (resp.response !== null) {
            const valid = await compare(password, resp.response.password);

            if (valid === true) {
                const { password, ...ret } = resp.response;
                return {
                    response: ret as PasswordlessUserDto,
                    error: null
                };
            }

        }

        return {
            response: null,
            error: 'invalid_credentials'
        };

    }

    /**
     * Create new local account
     *
     * @param email
     * @param password
     * @param username
     * @param wallet
     */
    async createT721User(email: string, password: string, username: string, wallet: EncryptedWallet): Promise<ServiceResponse<PasswordlessUserDto>> {

        const emailUserResp: ServiceResponse<UserDto> = await this.usersService.findByEmail(email);
        if (emailUserResp.error) return emailUserResp;

        const emailUser: UserDto = emailUserResp.response;
        if (emailUser !== null) {
            return {
                response: null,
                error: 'email_already_in_use'
            };
        }

        const usernameUserResp: ServiceResponse<UserDto> = await this.usersService.findByUsername(username);
        if (usernameUserResp.error) return usernameUserResp;

        const usernameUser: UserDto = usernameUserResp.response;
        if (usernameUser !== null) {
            return {
                response: null,
                error: 'username_already_in_use'
            };
        }

        if (!isV3EncryptedWallet(wallet)) {
            return {
                response: null,
                error: 'invalid_wallet_format'
            };
        }

        const address = toAcceptedAddressFormat(wallet.address);
        const addressUserResp: ServiceResponse<UserDto> = await this.usersService.findByAddress(address);
        if (addressUserResp.error) return addressUserResp;

        const addressUser: UserDto = addressUserResp.response;
        if (addressUser !== null) {
            return {
                response: null,
                error: 'address_already_in_use'
            };
        }

        if (!isKeccak256(password)) {
            return {
                response: null,
                error: 'password_should_be_keccak256'
            };
        }

        const new_user: ServiceResponse<UserDto> = await this.usersService.create({
            email,
            password: await hash(password, parseInt(this.configService.get('BCRYPT_SALT_ROUNDS'))),
            username,
            wallet: JSON.stringify(wallet),
            address,
            type: 't721',
            role: 'authenticated'
        });

        if (new_user.error) return new_user;

        delete new_user.response.password;

        return {
            response: new_user.response,
            error: null
        };

    }
}
