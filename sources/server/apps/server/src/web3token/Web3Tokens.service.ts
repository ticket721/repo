import { Injectable }                       from '@nestjs/common';
import {
    InjectRepository, InjectModel, BaseModel,
}                                           from '@iaminfinity/express-cassandra';
import { types }                            from 'cassandra-driver';
import { Web3TokensRepository }             from './Web3Tokens.repository';
import { Web3TokenEntity }                  from './entities/Web3Token.entity';
import { ServiceResponse }                  from '@app/server/utils/ServiceResponse';
import { RegisterWeb3TokenServiceInputDto } from '@app/server/web3token/dto/RegisterWeb3TokenServiceInput.dto';
import { Web3TokenDto }                     from '@app/server/web3token/dto/Web3Token.dto';
import { Interval, NestSchedule }           from 'nest-schedule';
import { ConfigService }                    from '@lib/common/config/Config.service';
import { ESSearchReturn }                   from '@app/server/utils/ESSearchReturn';
import { toAcceptedAddressFormat }          from '@ticket721sources/global';

/**
 * Utilities and services around the user entity
 */
@Injectable()
export class Web3TokensService extends NestSchedule {

    /**
     * Dependency Injection
     *
     * @param web3TokensRepository
     * @param web3TokensEntity
     * @param configService
     */
    constructor(
        @InjectRepository(Web3TokensRepository)
        private readonly web3TokensRepository: Web3TokensRepository,
        @InjectModel(Web3TokenEntity)
        private readonly web3TokensEntity: BaseModel<Web3TokenEntity>,
        private readonly configService: ConfigService,
    ) {
        super();
    }

    /**
     * Create a new web3 token
     *
     * @param token
     */
    async register(token: RegisterWeb3TokenServiceInputDto): Promise<ServiceResponse<Web3TokenDto>> {
        try {
            const created_token = await this.web3TokensRepository.save(
                this.web3TokensRepository.create({
                    timestamp: (types.Long as any).fromNumber(token.timestamp),
                    address: token.address,
                }),
                {
                    ttl: parseInt(this.configService.get('AUTH_SIGNATURE_TIMEOUT'))
                }
            ).toPromise();

            return {
                response: created_token,
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
     * Create a new web3 token
     *
     * @param token
     */
    async check(token: RegisterWeb3TokenServiceInputDto): Promise<ServiceResponse<Web3TokenDto>> {
        try {
            const existing_token: Web3TokenDto = await this.web3TokensRepository.findOne({
                timestamp: (types.Long as any).fromNumber(token.timestamp),
                address: token.address,
            }).toPromise();

            return {
                response: existing_token || null,
                error: null,
            };

        } catch (e) {
            return {
                response: null,
                error: 'unexpected_error',
            };
        }

    }

}
