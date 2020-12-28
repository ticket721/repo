import { Injectable } from '@nestjs/common';
import { PasswordlessUserDto } from './dto/PasswordlessUser.dto';
import { compare, hash } from 'bcrypt';
import { isKeccak256 } from '@common/global';
import { UsersService } from '@lib/common/users/Users.service';
import { ConfigService } from '@lib/common/config/Config.service';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { PurchasesService } from '@lib/common/purchases/Purchases.service';
import { UUIDToolService } from '@lib/common/toolbox/UUID.tool.service';
import { PurchaseEntity } from '@lib/common/purchases/entities/Purchase.entity';
import { CRUDResponse } from '@lib/common/crud/CRUDExtension.base';
import { v4 } from 'uuid';
import { UserEntity } from '@lib/common/users/entities/User.entity';

/**
 * Placeholder address until Ethereum is reintegrated
 */
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

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
     * @param purchasesService
     * @param uuidToolService
     */
    constructor /* instanbul ignore next */(
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
        private readonly purchasesService: PurchasesService,
        private readonly uuidToolService: UUIDToolService,
    ) {}

    /**
     * Convert integer to hex string
     *
     * @param val
     * @private
     */
    private intToHex(val: number): string {
        const strVal = val.toString(16);
        if (strVal.length % 2) {
            return `0${strVal}`;
        }
        return strVal;
    }

    /**
     * Compute unique uuid from google id + constant string
     * @param id
     * @private
     */
    private computeGoogleUUIDV4(id: string): string {
        return v4({
            random: Buffer.concat([
                Buffer.from(this.intToHex(parseInt(id, 10)), 'hex'),
                Buffer.from('google account unique identifier'),
            ]),
        });
    }

    /**
     * Call to create a new user or simply retrieve existing one from google authentication
     *
     * @param email
     * @param firstName
     * @param lastName
     * @param id
     * @param locale
     * @param avatar
     */
    async createOrRetrieveGoogleUser(
        email: string,
        firstName: string,
        lastName: string,
        id: string,
        locale: string,
        avatar: string,
    ): Promise<ServiceResponse<PasswordlessUserDto>> {
        const googleId = this.computeGoogleUUIDV4(id);

        const usersResp = await this.usersService.findById(googleId);

        if (usersResp.error) {
            return {
                error: usersResp.error,
                response: null,
            };
        }

        if (usersResp.response !== null) {
            const user: UserEntity = usersResp.response;

            if (user.avatar !== avatar) {
                user.avatar = avatar;

                const updateRes = await this.usersService.update(user);

                if (updateRes.error) {
                    return {
                        error: updateRes.error,
                        response: null,
                    };
                }
            }

            delete user.password;
            delete user.current_purchase;
            delete user.past_purchases;

            return {
                error: null,
                response: user,
            };
        } else {
            const rocksideFinalAddress = {
                error: null,
                response: {
                    address: ZERO_ADDRESS,
                },
            };

            if (rocksideFinalAddress.error) {
                return {
                    response: null,
                    error: 'rockside_identity_creation_error',
                };
            }

            const purchaseId = this.uuidToolService.generate();

            const initialPurchase: CRUDResponse<PurchaseEntity> = await this.purchasesService.create({
                owner: purchaseId,
                fees: [],
                products: [],
                currency: null,
                payment: null,
                payment_interface: null,
                checked_out_at: null,
                price: null,
            });

            if (initialPurchase.error) {
                return {
                    error: initialPurchase.error,
                    response: null,
                };
            }

            const purchase: PurchaseEntity = initialPurchase.response;

            const newUser: ServiceResponse<UserDto> = await this.usersService.create({
                id: UUIDToolService.fromString(googleId),
                current_purchase: UUIDToolService.fromString(purchase.id),
                email,
                password: null,
                username: `${firstName} ${lastName}`,
                device_address: null,
                address: rocksideFinalAddress.response.address,
                type: 'google',
                role: 'authenticated',
                locale,
                admin: false,
                valid: true,
                avatar,
            });

            if (newUser.error) {
                return newUser;
            }

            newUser.response.id = newUser.response.id.toString();

            delete newUser.response.password;
            delete (newUser.response as any).current_purchase;
            delete (newUser.response as any).past_purchases;

            return {
                error: null,
                response: newUser.response,
            };
        }
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
     * Validates an user account
     *
     * @param id
     */
    async validateUserEmail(id: string): Promise<ServiceResponse<PasswordlessUserDto>> {
        const updatedUserResp: ServiceResponse<UserDto> = await this.usersService.update({
            id,
            valid: true,
        });

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
     * @param locale
     */
    async createT721User(
        email: string,
        password: string,
        username: string,
        locale: string,
    ): Promise<ServiceResponse<PasswordlessUserDto>> {
        const emailUserResp: ServiceResponse<UserDto> = await this.usersService.findByEmail(email);
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

        const usernameUserResp: ServiceResponse<UserDto> = await this.usersService.findByUsername(username);
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

        // const rocksideFinalAddress = await this.rocksideService.createIdentity();
        const rocksideFinalAddress = {
            error: null,
            response: {
                address: ZERO_ADDRESS,
            },
        };

        if (rocksideFinalAddress.error) {
            return {
                response: null,
                error: 'rockside_identity_creation_error',
            };
        }

        const addressUserResp: ServiceResponse<UserDto> = await this.usersService.findByAddress(
            rocksideFinalAddress.response.address,
        );

        if (addressUserResp.error) {
            return addressUserResp;
        }

        const addressUser: UserDto = addressUserResp.response;

        if (rocksideFinalAddress.response.address !== ZERO_ADDRESS && addressUser !== null) {
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

        const id = this.uuidToolService.generate();

        const initialPurchase: CRUDResponse<PurchaseEntity> = await this.purchasesService.create({
            owner: id,
            fees: [],
            products: [],
            currency: null,
            payment: null,
            payment_interface: null,
            checked_out_at: null,
            price: null,
        });

        if (initialPurchase.error) {
            return {
                error: initialPurchase.error,
                response: null,
            };
        }

        const purchase: PurchaseEntity = initialPurchase.response;

        const newUser: ServiceResponse<UserDto> = await this.usersService.create({
            id: UUIDToolService.fromString(id),
            current_purchase: UUIDToolService.fromString(purchase.id),
            email,
            password: await hash(password, parseInt(this.configService.get('BCRYPT_SALT_ROUNDS'), 10)),
            username,
            device_address: null,
            address: rocksideFinalAddress.response.address,
            type: 't721',
            role: 'authenticated',
            locale,
            admin: false,
            avatar: null,
        });

        if (newUser.error) {
            return newUser;
        }

        newUser.response.id = newUser.response.id.toString();

        delete newUser.response.password;
        delete (newUser.response as any).current_purchase;
        delete (newUser.response as any).past_purchases;

        return {
            response: newUser.response,
            error: null,
        };
    }

    /**
     * Returns true if email exists for given username
     *
     * @param email
     */
    async getUserIfEmailExists(email: string): Promise<ServiceResponse<PasswordlessUserDto>> {
        const emailUserResp: ServiceResponse<UserDto> = await this.usersService.findByEmail(email);
        if (emailUserResp.error) {
            return {
                response: null,
                error: emailUserResp.error,
            };
        } else if (emailUserResp.response === null) {
            return {
                response: null,
                error: null,
            };
        } else {
            delete emailUserResp.response.password;
        }
        return {
            response: emailUserResp.response,
            error: null,
        };
    }

    /**
     * Reset user password
     *
     * @param id
     * @param password
     */
    async validateResetPassword(id: string, password: string): Promise<ServiceResponse<PasswordlessUserDto>> {
        if (!isKeccak256(password)) {
            return {
                response: null,
                error: 'password_should_be_keccak256',
            };
        }
        const updatedUserResp: ServiceResponse<UserDto> = await this.usersService.update({
            id,
            password: await hash(password, parseInt(this.configService.get('BCRYPT_SALT_ROUNDS'), 10)),
        });
        if (updatedUserResp.response) {
            delete updatedUserResp.response.password;
        }

        return updatedUserResp;
    }

    /**
     * Update user's password
     *
     * @param email
     * @param password
     */
    async updateUserPassword(email: string, password: string): Promise<ServiceResponse<PasswordlessUserDto>> {
        const emailUserResp: ServiceResponse<UserDto> = await this.usersService.findByEmail(email);
        if (emailUserResp.error) {
            return {
                response: null,
                error: 'user_not_found',
            };
        }
        const user: UserDto = emailUserResp.response;

        if (!isKeccak256(password)) {
            return {
                response: null,
                error: 'password_should_be_keccak256',
            };
        }

        const updatedUser: ServiceResponse<UserDto> = await this.usersService.update({
            id: user.id,
            password: await hash(password, parseInt(this.configService.get('BCRYPT_SALT_ROUNDS'), 10)),
        });
        if (updatedUser.error) {
            return updatedUser;
        }

        delete updatedUser.response.password;

        return {
            response: updatedUser.response,
            error: null,
        };
    }
}
