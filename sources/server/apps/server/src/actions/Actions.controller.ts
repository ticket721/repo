import { Controller } from '@nestjs/common';
import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';

@Controller('actions')
export class ActionsController {
    constructor(private readonly actionSetsService: ActionSetsService) {}
}
