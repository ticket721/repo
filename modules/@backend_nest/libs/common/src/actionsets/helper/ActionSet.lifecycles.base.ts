import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet.class';

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

    /**
     * ActionSet lifecycle method called on error
     *
     * @param actionSet
     */
    public abstract onFailure(actionSet: ActionSet): Promise<ServiceResponse<void>>;
}
