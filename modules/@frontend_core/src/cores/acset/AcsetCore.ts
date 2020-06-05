import { ActionSetEntity }           from '@common/sdk/lib/@backend_nest/libs/common/src/actionsets/entities/ActionSet.entity';

export abstract class AcsetCore {

    /**
     * @return acset id
     * @param token
     * @param acsetType (i.e: event_create)
     * @param initialArgs
     */
    public static createAcset = async (token: string, acsetType: string, initialArgs: any = {}): Promise<ActionSetEntity> => {
        console.log(acsetType, initialArgs);
        try {
            const createAcsetResp = await global.window.t721Sdk.actions.create(token, {
                name: acsetType,
                arguments: initialArgs
            });

            return createAcsetResp.data.actionset;
        } catch (e) {
            if (e.response.data.statusCode === 400) {
                throw Error('bad_request_error');
            } else if (e.response.data.statusCode === 500) {
                throw Error('internal_server_error');
            } else {
                throw e;
            }
        }
    };

    /**
     * @return acset entity
     * @param token
     * @param acsetId
     * @param args
     * @param actionIdx
     */
    public static updateAcset = async (token: string, acsetId: string, args: any, actionIdx?: number): Promise<ActionSetEntity> => {
        try {
            const updateAcsetResp = await global.window.t721Sdk.actions.update(token, acsetId, {
                data: args,
                action_idx: actionIdx || null
            });

            return updateAcsetResp.data.actionset;
        } catch (e) {
            if (e.response.data.statusCode === 400) {
                throw Error('bad_request_error');
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
