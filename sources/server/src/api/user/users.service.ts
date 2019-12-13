import { Injectable }      from '@nestjs/common';
import {
    uuid,
    InjectRepository, InjectModel, BaseModel, Repository, FindQuery,
}                          from '@iaminfinity/express-cassandra';
import { tap }             from 'rxjs/operators';
import { Observable }      from 'rxjs';
import { UsersRepository } from './users.repository';
import { UserEntity }      from './entities/user.entity';
import { CreateUserDto }   from './dto/create.user.dto';
import { ESSearchReturn }  from '../../utils/ESSearchReturn';
import { UserDto }         from './dto/user.dto';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(UsersRepository)
        private readonly usersRepository: UsersRepository,
        @InjectModel(UserEntity)
        private readonly userEntity: BaseModel<UserEntity>
    ) {}

    create(user: CreateUserDto): Promise<UserEntity> {
        return this.usersRepository.save(
            this.usersRepository.create(user)
        ).toPromise();
    }

    findAll(q: FindQuery<UserEntity> = {}): Promise<[UserEntity[], number]> {
        return this.usersRepository.findAndCount(q).toPromise();
    }

    async findByEmail(email: string): Promise<UserDto> {

        let res: ESSearchReturn<UserDto>;

        try {
            res = await new Promise<ESSearchReturn<UserDto>>((ok, ko): void => {
                this.userEntity.search({
                    body: {
                        query: {
                            match: {
                                email
                            }
                        }
                    }
                }, (err, resp): void => {
                    if (err) return ko(err);
                    ok(resp);
                })
            });
        } catch (e) {
            throw new Error(`Unexpected error while searching for user by email: ${e.message}`);
        }

        if (!res || res.hits.total === 0) {
            return null;
        }

        return res.hits.hits[0]._source;

    }

    async findByUsername(username: string): Promise<UserDto> {

        let res: ESSearchReturn<UserDto>;

        try {
            res = await new Promise<ESSearchReturn<UserDto>>((ok, ko): void => {
                this.userEntity.search({
                    body: {
                        query: {
                            match: {
                                username
                            }
                        }
                    }
                }, (err, resp): void => {
                    if (err) return ko(err);
                    ok(resp);
                })
            });
        } catch (e) {
            throw new Error(`Unexpected error while searching for user by username: ${e.message}`);
        }

        if (!res || res.hits.total === 0) {
            return null;
        }

        return res.hits.hits[0]._source;

    }


}
