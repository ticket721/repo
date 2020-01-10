import { Module } from '@nestjs/common';
import { ActionsController } from '@app/server/actions/Actions.controller';
import { ActionSetsModule } from '@lib/common/actionsets/ActionSets.module';

@Module({
    imports: [ActionSetsModule],
    controllers: [ActionsController],
})
export class ActionsModule {}
