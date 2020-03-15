import { Module } from '@nestjs/common';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { EVMBlockRollbackEntity } from '@lib/common/evmblockrollbacks/entities/EVMBlockRollback.entity';
import { EVMBlockRollbacksRepository } from '@lib/common/evmblockrollbacks/EVMBlockRollbacks.repository';
import { EVMBlockRollbacksService } from '@lib/common/evmblockrollbacks/EVMBlockRollbacks.service';

/**
 * Module to handle the Block Rollbacks
 */
@Module({
    imports: [ExpressCassandraModule.forFeature([EVMBlockRollbackEntity, EVMBlockRollbacksRepository])],
    providers: [EVMBlockRollbacksService],
    exports: [EVMBlockRollbacksService],
})
export class EVMBlockRollbacksModule {}
