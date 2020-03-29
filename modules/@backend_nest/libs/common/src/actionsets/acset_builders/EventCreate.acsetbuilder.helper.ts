import { ActionSetBuilderBase } from '@lib/common/actionsets/helper/ActionSet.builder.base';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet.class';
import { Action } from '@lib/common/actionsets/helper/Action.class';
import { UserDto } from '@lib/common/users/dto/User.dto';

/**
 * Initial arguments to create the event creation
 */
export interface EventCreateAcsetBuilderArgs {
    /**
     * Initial event name
     */
    name: string;
}

/**
 * ActionSet builder class for the event creation process
 */
export class EventCreateAcsetbuilderHelper implements ActionSetBuilderBase<EventCreateAcsetBuilderArgs> {
    /**
     * ActionSet builder method
     *
     * @param caller
     * @param args
     */
    async buildActionSet(caller: UserDto, args: EventCreateAcsetBuilderArgs): Promise<ServiceResponse<ActionSet>> {
        try {
            const actions: Action[] = [
                new Action()
                    .setName('@events/textMetadata')
                    .setData<EventCreateAcsetBuilderArgs>(args)
                    .setType('input')
                    .setStatus('in progress'),
                new Action()
                    .setName('@events/modulesConfiguration')
                    .setType('input')
                    .setStatus('in progress'),
                new Action()
                    .setName('@events/datesConfiguration')
                    .setType('input')
                    .setStatus('in progress'),
                new Action()
                    .setName('@events/categoriesConfiguration')
                    .setType('input')
                    .setStatus('in progress'),
                new Action()
                    .setName('@events/imagesMetadata')
                    .setType('input')
                    .setStatus('in progress'),
                new Action()
                    .setName('@events/adminsConfiguration')
                    .setType('input')
                    .setStatus('in progress'),
            ];
            return {
                error: null,
                response: new ActionSet()
                    .setName('@events/creation')
                    .setActions(actions)
                    .setStatus('input:in progress'),
            };
        } catch (e) {
            return {
                error: 'acset_build_error',
                response: null,
            };
        }
    }
}
