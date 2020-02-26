import { Module } from '@nestjs/common';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { EVMEventSetEntity } from '@lib/common/evmeventsets/entities/EVMEventSet.entity';
import { EVMEventSetsRepository } from '@lib/common/evmeventsets/EVMEventSets.repository';
import { EVMEventSetsService } from '@lib/common/evmeventsets/EVMEventSets.service';

/**
 * EVMEventSets Module, fetches and applies changes from Ethereum Contracts
 */
@Module({
    imports: [
        ExpressCassandraModule.forFeature([
            EVMEventSetEntity,
            EVMEventSetsRepository,
        ]),
    ],
    providers: [EVMEventSetsService],
    exports: [EVMEventSetsService],
})
export class EVMEventSetsModule {}
