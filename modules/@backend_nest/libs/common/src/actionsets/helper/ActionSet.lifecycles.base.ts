import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet.class';
import { UserDto } from '@lib/common/users/dto/User.dto';

/**
 * Abstract Class for the ActionSet lifecycle events
 */
export abstract class ActionSetLifecyclesBase {
    /**
     * ActionSet lifecycle method called on completion
     *
     * @param actionSet
     */
    public abstract onComplete(actionSet: ActionSet): Promise<ServiceResponse<void>>;
}
