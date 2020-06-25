import {
    EventCreateAcsetBuilderArgs,
    EventCreateAcsetbuilderHelper,
} from '@lib/common/events/acset_builders/EventCreate.acsetbuilder.helper';
import { UserDto } from '@lib/common/users/dto/User.dto';

describe('EventCreate AcSetBuilder Helper', function() {
    const context: {
        eventCreateAcsetBuilderHelper: EventCreateAcsetbuilderHelper;
    } = {
        eventCreateAcsetBuilderHelper: null,
    };

    beforeEach(async function() {
        context.eventCreateAcsetBuilderHelper = new EventCreateAcsetbuilderHelper();
    });

    it('should properly build initial event creation actionset for user', async function() {
        const user = {
            id: 'user_id',
        } as UserDto;

        const initialArguments: EventCreateAcsetBuilderArgs = {};

        const actionSet = await context.eventCreateAcsetBuilderHelper.buildActionSet(user, initialArguments);

        expect(actionSet.response.raw).toEqual({
            name: '@events/creation',
            consumed: false,
            dispatched_at: actionSet.response.raw.dispatched_at,
            actions: [
                {
                    type: 'input',
                    name: '@events/textMetadata',
                    data: '{}',
                    error: null,
                    status: 'in progress',
                    private: false,
                },
                {
                    type: 'input',
                    name: '@events/imagesMetadata',
                    data: null,
                    error: null,
                    status: 'in progress',
                    private: false,
                },
                {
                    type: 'input',
                    name: '@events/modulesConfiguration',
                    data: null,
                    error: null,
                    status: 'in progress',
                    private: false,
                },
                {
                    type: 'input',
                    name: '@events/datesConfiguration',
                    data: null,
                    error: null,
                    status: 'in progress',
                    private: false,
                },
                {
                    type: 'input',
                    name: '@events/categoriesConfiguration',
                    data: null,
                    error: null,
                    status: 'in progress',
                    private: false,
                },
                {
                    type: 'input',
                    name: '@events/adminsConfiguration',
                    data: null,
                    error: null,
                    status: 'in progress',
                    private: false,
                },
            ],
            current_action: 0,
            current_status: 'input:in progress',
        });
        expect(actionSet.error).toEqual(null);
    });

    it('should fail on args validation', async function() {
        const user = {
            id: 'user_id',
        } as UserDto;

        const initialArguments: EventCreateAcsetBuilderArgs = {
            name: 'this is an invalid argument',
        } as EventCreateAcsetBuilderArgs;

        const actionSet = await context.eventCreateAcsetBuilderHelper.buildActionSet(user, initialArguments);

        expect(actionSet.error).toEqual('acset_invalid_arguments');
        expect(actionSet.response).toEqual(null);
    });
});
