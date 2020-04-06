import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet.class';
import { UserDto } from '@lib/common/users/dto/User.dto';

/**
 * Abstract Class for the ActionSet builders
 */
export abstract class ActionSetBuilderBase<BuildArgs = any> {
    /**
     * ActionSet builder method
     *
     * @param caller
     * @param args
     */
    public abstract buildActionSet(caller: UserDto, args: BuildArgs): Promise<ServiceResponse<ActionSet>>;
}
