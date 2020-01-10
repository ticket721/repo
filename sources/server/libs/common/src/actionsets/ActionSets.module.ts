import { Module } from '@nestjs/common';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { ActionSetEntity } from '@lib/common/actionsets/entity/ActionSet.entity';
import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { ActionSetsRepository } from '@lib/common/actionsets/ActionSets.repository';

@Module({
    imports: [
        ExpressCassandraModule.forFeature([
            ActionSetEntity,
            ActionSetsRepository,
        ]),
    ],
    providers: [ActionSetsService],
    exports: [ActionSetsService],
})
export class ActionSetsModule {}
