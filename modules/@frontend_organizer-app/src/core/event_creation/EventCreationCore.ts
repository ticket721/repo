import { ActionSetEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/actionsets/entities/ActionSet.entity';
import { default as get }  from 'lodash.get';
import { AcsetCore }       from '@frontend/core/lib/cores/acset/AcsetCore';
import '@frontend/core/lib/utils/window';

export enum EventCreationActions {
    TextMetadata = 'textMetadata',
    ImagesMetadata = 'imagesMetadata',
    ModulesConfiguration = 'modulesConfiguration',
    DatesConfiguration = 'datesConfiguration',
    CategoriesConfiguration = 'categoriesConfiguration',
    AdminsConfiguration = 'adminsConfiguration',
}

export abstract class EventCreationCore {

    public static getAcsetId = async (token: string): Promise<string | false> => {
        const lastInProgressEventAcsetResp = await global.window.t721Sdk.actions.search(
            token,
            {
                $sort: [{
                    $field_name: 'updated_at',
                    $order: 'desc'
                }],
                $page_size: 1,
                current_status: {
                    $ne: 'complete'
                },
                name: {
                    $eq: '@events/creation'
                }
            }
        );
console.log('getAcsetId', lastInProgressEventAcsetResp);
        return !lastInProgressEventAcsetResp.data.actionsets.length ?
            false
            : lastInProgressEventAcsetResp.data.actionsets[0].id;
    };

    /**
     * @return acset id
     * @param token
     * @param initialArgs
     */
    public static createEventAcset = async (token: string, initialArgs: any = {}): Promise<string> => {
        const createEventAcsetResp = await AcsetCore.createAcset(
            token,
            'event_create',
            initialArgs
        );

        return createEventAcsetResp.id;
    };

    /**
     * @return event acset entity
     * @param token
     * @param acsetId
     * @param action
     * @param args
     */
    public static updateEventAcset = async (
        token: string,
        acsetId: string,
        action: EventCreationActions,
        args: any
    ): Promise<ActionSetEntity> => {
        const sdkMethod = get(global.window.t721Sdk?.events.create, action, undefined);

        if (!sdkMethod) {
            throw new Error(`Specified action ${action} does not correspond to any events T721 SDK method`);
        }

        const updateEventAcsetResp = await sdkMethod(token, acsetId, args);

        return updateEventAcsetResp.data.actionset;
    };

    public static createEvent = async (token: string, acsetId: string): Promise<string> => {
        try {
            if (!global.window.t721Sdk) {
                throw Error('t721sdk_undefined');
            }

            const createEventResp = await global.window.t721Sdk.events.create.create(token, { completedActionSet: acsetId });

            return createEventResp.data.event.id;
        } catch (e) {
            if (e.response.data.statusCode === 400) {
                throw Error('incomplete_event_acset_error');
            } else if (e.response.data.statusCode === 401) {
                throw Error('unauthorized_error');
            } else if (e.response.data.statusCode === 500) {
                throw Error('internal_server_error');
            } else {
                throw e;
            }
        }
    };

    public static startEvent = async (token: string, eventId: string, dates?: string[]): Promise<string> => {
        try {
            if (!global.window.t721Sdk) {
                throw Error('t721sdk_undefined');
            }

            const startEventResp = await global.window.t721Sdk.events.start(token, {
                event: eventId,
                dates
            });

            return startEventResp.data.event.id;
        } catch (e) {
            if (e.response.data.statusCode === 400) {
                throw Error(e.response.data.message);
            } else if (e.response.data.statusCode === 401) {
                throw Error('unauthorized_error');
            } else if (e.response.data.statusCode === 404) {
                throw Error('event_acset_not_found_error');
            } else if (e.response.data.statusCode === 500) {
                throw Error('internal_server_error');
            } else {
                throw e;
            }
        }
    }
}
