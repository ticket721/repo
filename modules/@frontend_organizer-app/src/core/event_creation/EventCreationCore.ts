import { ActionSetEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/actionsets/entities/ActionSet.entity';
import { default as get } from 'lodash.get';
import { AcsetCore } from '@frontend/core/lib/cores/acset/AcsetCore';
import '@frontend/core/lib/utils/window';

export enum EventCreationActions {
    TextMetadata = 'textMetadata',
    ImagesMetadata = 'imagesMetadata',
    ModulesConfiguration = 'modulesConfiguration',
    DatesConfiguration = 'datesConfiguration',
    CategoriesConfiguration = 'categoriesConfiguration',
    AdminsConfiguration = 'adminsConfiguration',
}

export enum EventCreationSteps {
    None = -1,
    GeneralInfo,
    Styles,
    Modules,
    Dates,
    Categories,
    Admins,
}

export abstract class EventCreationCore {

    /**
     * @return event id
     * @param token
     * @param acsetId
     */
    public static createEvent = async (
        token: string,
        acsetId: string
    ): Promise<string> => {
        try {
            if (!global.window.t721Sdk) {
                throw Error('t721sdk_undefined');
            }

            const createEventResp = await global.window.t721Sdk.events.create.create(
                token,
                { completedActionSet: acsetId }
            );

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

    /**
     * @return event id
     * @param token
     * @param eventId
     * @param dates
     */
    public static startEvent = async (
        token: string,
        eventId: string,
        dates?: string[]
    ): Promise<string> => {
        try {
            if (!global.window.t721Sdk) {
                throw Error('t721sdk_undefined');
            }

            // const startEventResp = await global.window.t721Sdk.events.start(
            //     token,
            //     {
            //         event: eventId,
            //         dates,
            //     }
            // );

            // return startEventResp.data.event.id;
            throw Error('Implement publish event');
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
    };

    public static uploadImages = async (
        token: string,
        data: FormData,
        headers: any
    ): Promise<string[]> => {
        try {
            if (!global.window.t721Sdk) {
                throw Error('t721sdk_undefined');
            }

            const imageUploadResp = await global.window.t721Sdk.images.upload(
                token,
                data,
                headers
            );

            return imageUploadResp.data.urls;
        } catch (e) {
            if (e.response.data.statusCode === 400) {
                throw Error(e.response.data.message);
            } else if (e.response.data.statusCode === 401) {
                throw Error('unauthorized_error');
            } else if (e.response.data.statusCode === 500) {
                throw Error('internal_server_error');
            } else {
                throw e;
            }
        }
    };
}
