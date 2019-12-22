import { EntityRepository, Repository } from '@iaminfinity/express-cassandra';
import { Web3TokenEntity }              from '@app/server/web3token/entities/Web3Token.entity';

/**
 * Web3Token entity repository
 */
@EntityRepository(Web3TokenEntity)
export class Web3TokensRepository extends Repository<Web3TokenEntity> {
}
