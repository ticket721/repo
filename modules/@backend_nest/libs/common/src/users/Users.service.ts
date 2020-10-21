import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectModel, BaseModel, uuid } from '@iaminfinity/express-cassandra';
import { UsersRepository } from './Users.repository';
import { UserEntity } from './entities/User.entity';
import { UserDto } from './dto/User.dto';
import { CreateUserServiceInputDto } from './dto/CreateUserServiceInput.dto';
import { toAcceptedAddressFormat } from '@common/global';
import { ESSearchReturn } from '@lib/common/utils/ESSearchReturn.type';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { UUIDToolService } from '@lib/common/toolbox/UUID.tool.service';

/**
 * Utilities and services around the user entity
 */
@Injectable()
export class UsersService {
    /**
     * Dependency Injection
     *
     * @param usersRepository
     * @param userEntity
     */
    constructor /* instanbul ignore next */(
        @InjectRepository(UsersRepository)
        private readonly usersRepository: UsersRepository,
        @InjectModel(UserEntity)
        private readonly userEntity: BaseModel<UserEntity>,
    ) {}

    /**
     * Update User infos
     *
     * @param user
     */
    async update(user: Partial<UserEntity>): Promise<ServiceResponse<UserDto>> {
        try {
            const { id, ...complete_user } = user;

            await this.usersRepository
                .update(
                    {
                        id: uuid(id) as any,
                    },
                    complete_user,
                )
                .toPromise();

            return this.findById(id);
        } catch (e) {
            return {
                response: null,
                error: 'unexpected_error',
            };
        }
    }

    /**
     * Create a new user
     *
     * @param user
     */
    async create(user: CreateUserServiceInputDto): Promise<ServiceResponse<UserDto>> {
        try {
            const createdUser = await this.usersRepository
                .save(
                    this.usersRepository.create({
                        ...user,
                        past_purchases: [],
                        valid: false,
                    }),
                )
                .toPromise();

            return {
                response: createdUser,
                error: null,
            };
        } catch (e) {
            console.error(e);
            return {
                response: null,
                error: 'unexpected_error',
            };
        }
    }

    /**
     * Retrieve user by uuid
     *
     * @param id
     */
    async findById(id: string): Promise<ServiceResponse<UserEntity>> {
        try {
            const user: UserEntity = await this.usersRepository.findOne({ id: uuid(id) as any }).toPromise();
            return {
                response: user || null,
                error: null,
            };
        } catch (e) {
            return {
                response: null,
                error: 'unexpected_error',
            };
        }
    }

    async recoverUserCart(id: string): Promise<ServiceResponse<string>> {
        try {
            const user: UserEntity = await this.usersRepository
                .findOne({ id: UUIDToolService.fromString(id) })
                .toPromise();
            if (user === null) {
                return {
                    error: 'user_not_found',
                    response: null,
                };
            }
            return {
                response: user.current_purchase,
                error: null,
            };
        } catch (e) {
            console.log(e);
            return {
                response: null,
                error: 'unexpected_error',
            };
        }
    }

    /**
     * Find a user by its address
     *
     * @param address
     */
    async findByAddress(address: string): Promise<ServiceResponse<UserDto>> {
        let res: ESSearchReturn<UserDto>;
        const formattedAddress = toAcceptedAddressFormat(address);

        if (!formattedAddress) {
            return {
                response: null,
                error: 'invalid_address_format',
            };
        }

        try {
            res = await new Promise<ESSearchReturn<UserDto>>((ok, ko): void => {
                this.userEntity.search(
                    {
                        body: {
                            query: {
                                match: {
                                    address,
                                },
                            },
                        },
                    },
                    (err, resp): void => {
                        if (err) {
                            return ko(err);
                        }
                        ok(resp);
                    },
                );
            });
        } catch (e) {
            return {
                response: null,
                error: 'unexpected_error',
            };
        }

        if (!res || res.hits.total === 0) {
            return {
                response: null,
                error: null,
            };
        }

        return {
            response: res.hits.hits[0]._source,
            error: null,
        };
    }

    /**
     * Find a user by its email
     *
     * @param email
     */
    async findByEmail(email: string): Promise<ServiceResponse<UserDto>> {
        let res: ESSearchReturn<UserDto>;

        try {
            res = await new Promise<ESSearchReturn<UserDto>>((ok, ko): void => {
                this.userEntity.search(
                    {
                        body: {
                            query: {
                                match: {
                                    email,
                                },
                            },
                        },
                    },
                    (err, resp): void => {
                        if (err) {
                            return ko(err);
                        }
                        ok(resp);
                    },
                );
            });
        } catch (e) {
            return {
                response: null,
                error: 'unexpected_error',
            };
        }

        if (!res || res.hits.total === 0) {
            return {
                response: null,
                error: null,
            };
        }

        return {
            response: res.hits.hits[0]._source,
            error: null,
        };
    }

    /**
     * Find a user by its username
     *
     * @param username
     */
    async findByUsername(username: string): Promise<ServiceResponse<UserDto>> {
        let res: ESSearchReturn<UserDto>;

        try {
            res = await new Promise<ESSearchReturn<UserDto>>((ok, ko): void => {
                this.userEntity.search(
                    {
                        body: {
                            query: {
                                match: {
                                    username,
                                },
                            },
                        },
                    },
                    (err, resp): void => {
                        if (err) {
                            return ko(err);
                        }
                        ok(resp);
                    },
                );
            });
        } catch (e) {
            return {
                response: null,
                error: 'unexpected_error',
            };
        }

        if (!res || res.hits.total === 0) {
            return {
                response: null,
                error: null,
            };
        }

        return {
            response: res.hits.hits[0]._source,
            error: null,
        };
    }

    /**
     * Set device address of user
     *
     * @param id
     * @param address
     */
    async setDeviceAddress(id: string, address: string): Promise<ServiceResponse<UserDto>> {
        const userUpdateResponse = await this.update({
            id,
            device_address: address,
        });

        if (userUpdateResponse.error) {
            return {
                error: userUpdateResponse.error,
                response: null,
            };
        }

        return {
            error: null,
            response: userUpdateResponse.response,
        };
    }
}
