import { Module } from '@nestjs/common';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { OperationsRepository } from '@lib/common/operations/Operations.repository';
import { OperationEntity } from '@lib/common/operations/entities/Operation.entity';
import { OperationsService } from '@lib/common/operations/Operations.service';

@Module({
    imports: [ExpressCassandraModule.forFeature([OperationEntity, OperationsRepository])],
    providers: [OperationsService],
    exports: [OperationsService],
})
export class OperationsModule {}
