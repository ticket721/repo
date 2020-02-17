import { Injectable } from '@nestjs/common';
import { PasswordlessUserDto } from './dto/PasswordlessUser.dto';
import { compare, hash } from 'bcrypt';
import {
    EncryptedWallet,
    isV3EncryptedWallet,
    toAcceptedAddressFormat,
    isKeccak256,
    Web3LoginSigner,
    Web3RegisterSigner,
    keccak256,
} from '@ticket721sources/global';
import { UsersService } from '@lib/common/users/Users.service';
import { ConfigService } from '@lib/common/config/Config.service';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { RefractFactoryV0Service } from '@lib/common/contracts/refract/RefractFactory.V0.service';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse';

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
     * @param refractFactoryService
     */
    constructor /* instanbul ignore next */(
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
        private readonly refractFactoryService: RefractFactoryV0Service,
    ) {}

    /**
     * Utility to verify if provided signature is bound to an account and is valid
     *
     * @param timestamp
     * @param signature
     */
    async validateWeb3User(
        timestamp: string,
        signature: string,
    ): Promise<ServiceResponse<PasswordlessUserDto>> {
        const web3LoginSigner: Web3LoginSigner = new Web3LoginSigner(1); // recover from web3 module

        const verification: [
            boolean,
            string,
        ] = await web3LoginSigner.verifyAuthenticationProof(
            signature,
            parseInt(timestamp, 10),
            parseInt(this.configService.get('AUTH_SIGNATURE_TIMEOUT'), 10) *
                1000,
        );

        if (verification[0] === false) {
            return {
                error: verification[1],
                response: null,
            };
        }

        const resp: ServiceResponse<UserDto> = await this.usersService.findByAddress(
            verification[1],
        );

        if (resp.error) {
            return resp;
        }

        if (resp.response !== null) {
            const { password, ...ret } = resp.response;
            return {
                response: ret as PasswordlessUserDto,
                error: null,
            };
        }

        return {
            response: null,
            error: 'invalid_signature',
        };
    }

    /**
     * Utility to verify if any user exists with given email, and if provided
     * password matches.
     *
     * @param email
     * @param password
     */
    async validateUser(
        email: string,
        password: string,
    ): Promise<ServiceResponse<PasswordlessUserDto>> {
        const resp: ServiceResponse<UserDto> = await this.usersService.findByEmail(
            email,
        );

        if (resp.error) {
            return resp;
        }

        if (resp.response !== null) {
            const valid = await compare(password, resp.response.password);

            if (valid === true) {
                delete resp.response.password;
                return {
                    response: resp.response as PasswordlessUserDto,
                    error: null,
                };
            }
        }

        return {
            response: null,
            error: 'invalid_credentials',
        };
    }

    /**
     * Create new web3 account
     *
     * @param email
     * @param username
     * @param timestamp
     * @param address Expected signing address
     * @param signature Signature of a Web3Register payload
     * @param locale
     */
    async createWeb3User(
        email: string,
        username: string,
        timestamp: string,
        address: string,
        signature: string,
        locale: string,
    ): Promise<ServiceResponse<PasswordlessUserDto>> {
        address = toAcceptedAddressFormat(address);

        const emailUserResp: ServiceResponse<UserDto> = await this.usersService.findByEmail(
            email,
        );
        if (emailUserResp.error) {
            return emailUserResp;
        }

        const emailUser: UserDto = emailUserResp.response;
        if (emailUser !== null) {
            return {
                response: null,
                error: 'email_already_in_use',
            };
        }

        const usernameUserResp: ServiceResponse<UserDto> = await this.usersService.findByUsername(
            username,
        );
        if (usernameUserResp.error) {
            return usernameUserResp;
        }

        const usernameUser: UserDto = usernameUserResp.response;
        if (usernameUser !== null) {
            return {
                response: null,
                error: 'username_already_in_use',
            };
        }

        const addressUserResp: ServiceResponse<UserDto> = await this.usersService.findByAddress(
            address,
        );
        if (addressUserResp.error) {
            return addressUserResp;
        }

        const addressUser: UserDto = addressUserResp.response;
        if (addressUser !== null) {
            return {
                response: null,
                error: 'address_already_in_use',
            };
        }

        const web3RegisterSigner: Web3RegisterSigner = new Web3RegisterSigner(
            1,
        );

        const verification: [
            boolean,
            string,
        ] = await web3RegisterSigner.verifyRegistrationProof(
            signature,
            parseInt(timestamp, 10),
            email,
            username,
            parseInt(this.configService.get('AUTH_SIGNATURE_TIMEOUT'), 10) *
                1000,
        );

        if (verification[0] === false) {
            return {
                response: null,
                error: verification[1],
            };
        }

        if (verification[1] !== address) {
            return {
                response: null,
                error: 'invalid_signature',
            };
        }

        const newUser: ServiceResponse<UserDto> = await this.usersService.create(
            {
                email,
                password: null,
                username,
                wallet: null,
                address,
                type: 'web3',
                role: 'authenticated',
                locale,
            },
        );

        if (newUser.error) {
            return newUser;
        }

        delete newUser.response.password;

        return {
            response: newUser.response,
            error: null,
        };
    }

    /**
     * Validates an user account
     *
     * @param id
     */
    async validateUserEmail(
        id: string,
    ): Promise<ServiceResponse<PasswordlessUserDto>> {
        const updatedUserResp: ServiceResponse<UserDto> = await this.usersService.update(
            {
                id,
                valid: true,
            },
        );

        if (updatedUserResp.error) {
            return updatedUserResp;
        }

        delete updatedUserResp.response.password;

        return {
            error: null,
            response: updatedUserResp.response,
        };
    }

    /**
     * Create new local account
     *
     * @param email
     * @param password
     * @param username
     * @param wallet
     * @param locale
     */
    async createT721User(
        email: string,
        password: string,
        username: string,
        wallet: EncryptedWallet,
        locale: string,
    ): Promise<ServiceResponse<PasswordlessUserDto>> {
        const emailUserResp: ServiceResponse<UserDto> = await this.usersService.findByEmail(
            email,
        );
        if (emailUserResp.error) {
            return emailUserResp;
        }

        const emailUser: UserDto = emailUserResp.response;
        if (emailUser !== null) {
            return {
                response: null,
                error: 'email_already_in_use',
            };
        }

        const usernameUserResp: ServiceResponse<UserDto> = await this.usersService.findByUsername(
            username,
        );
        if (usernameUserResp.error) {
            return usernameUserResp;
        }

        const usernameUser: UserDto = usernameUserResp.response;
        if (usernameUser !== null) {
            return {
                response: null,
                error: 'username_already_in_use',
            };
        }

        if (!isV3EncryptedWallet(wallet)) {
            return {
                response: null,
                error: 'invalid_wallet_format',
            };
        }

        const address = toAcceptedAddressFormat(wallet.address);

        const refractFactoryV0 = await this.refractFactoryService.get();
        const salt = keccak256(email);
        const finalAddress: string = toAcceptedAddressFormat(
            await refractFactoryV0.methods.predict(address, salt).call(),
        );

        const addressUserResp: ServiceResponse<UserDto> = await this.usersService.findByAddress(
            finalAddress,
        );
        if (addressUserResp.error) {
            return addressUserResp;
        }

        const addressUser: UserDto = addressUserResp.response;
        if (addressUser !== null) {
            return {
                response: null,
                error: 'address_already_in_use',
            };
        }

        if (!isKeccak256(password)) {
            return {
                response: null,
                error: 'password_should_be_keccak256',
            };
        }

        const newUser: ServiceResponse<UserDto> = await this.usersService.create(
            {
                email,
                password: await hash(
                    password,
                    parseInt(this.configService.get('BCRYPT_SALT_ROUNDS'), 10),
                ),
                username,
                wallet: JSON.stringify(wallet),
                address: finalAddress,
                type: 't721',
                role: 'authenticated',
                locale,
            },
        );

        if (newUser.error) {
            return newUser;
        }

        delete newUser.response.password;

        return {
            response: newUser.response,
            error: null,
        };
    }
}
