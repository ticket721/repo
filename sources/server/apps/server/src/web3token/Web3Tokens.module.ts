import { Module } from '@nestjs/common';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { Web3TokenEntity } from '@app/server/web3token/entities/Web3Token.entity';
import { Web3TokensRepository } from '@app/server/web3token/Web3Tokens.repository';
import { Web3TokensService } from '@app/server/web3token/Web3Tokens.service';

/**
 * Module to handle the creation and verification of web3 tokens. They prevent replay attacks
 */
@Module({
    imports: [
        ExpressCassandraModule.forFeature([
            Web3TokenEntity,
            Web3TokensRepository,
        ]),
    ],
    providers: [Web3TokensService],
    exports: [Web3TokensService],
})
export class Web3TokensModule {}
