import { Injectable }                from '@nestjs/common';
import {
    InjectRepository, InjectModel, BaseModel, uuid,
}                                    from '@iaminfinity/express-cassandra';
import { UsersRepository }           from './Users.repository';
import { UserEntity }                from './entities/User.entity';
import { UserDto }                   from './dto/User.dto';
import { CreateUserServiceInputDto } from './dto/CreateUserServiceInput.dto';
import { toAcceptedAddressFormat }   from '@ticket721sources/global';
import { ServiceResponse }           from '@app/server/utils/ServiceResponse';
import { ESSearchReturn }            from '@app/server/utils/ESSearchReturn';

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
    constructor /* instanbul ignore next */ (
        @InjectRepository(UsersRepository)
        private readonly usersRepository: UsersRepository,
        @InjectModel(UserEntity)
        private readonly userEntity: BaseModel<UserEntity>,
    ) {
    }

    /**
     * Create a new user
     *
     * @param user
     */
    async create(user: CreateUserServiceInputDto): Promise<ServiceResponse<UserDto>> {
        try {
            const created_user = await this.usersRepository.save(
                this.usersRepository.create(user),
            ).toPromise();

            return {
                response: created_user,
                error: null,
            };

        } catch (e) {
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
    async findById(id: string): Promise<ServiceResponse<UserDto>> {
        try {
            const user: UserDto = await this.usersRepository.findOne({ id: uuid(id) as any }).toPromise();
            return {
                response: user || null,
                error: null,
            };
        } catch (e) {
            return {
                response: null,
                error: 'unexpected_error'
            }
        }
    }

    /**
     * Find a user by its address
     *
     * @param address
     */
    async findByAddress(address: string): Promise<ServiceResponse<UserDto>> {

        let res: ESSearchReturn<UserDto>;
        const formatted_address = toAcceptedAddressFormat(address);

        if (!formatted_address) {
            return {
                response: null,
                error: 'invalid_address_format',
            };
        }

        try {
            res = await new Promise<ESSearchReturn<UserDto>>((ok, ko): void => {
                this.userEntity.search({
                    body: {
                        query: {
                            match: {
                                address,
                            },
                        },
                    },
                }, (err, resp): void => {
                    if (err) return ko(err);
                    ok(resp);
                });
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
                this.userEntity.search({
                    body: {
                        query: {
                            match: {
                                email,
                            },
                        },
                    },
                }, (err, resp): void => {
                    if (err) return ko(err);
                    ok(resp);
                });
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
                this.userEntity.search({
                    body: {
                        query: {
                            match: {
                                username,
                            },
                        },
                    },
                }, (err, resp): void => {
                    if (err) return ko(err);
                    ok(resp);
                });
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

}
