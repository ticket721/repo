import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';

/**
 * Helper method to properly call a contract method
 *
 * @param contract
 * @param method
 * @param callOptions
 * @param args
 */
export async function contractCallHelper(
    contract: any,
    method: string,
    callOptions: any,
    ...args: any[]
): Promise<ServiceResponse<any>> {
    try {
        return {
            error: null,
            response: await contract.methods[method](...args).call(callOptions),
        };
    } catch (e) {
        return {
            error: e.message,
            response: null,
        };
    }
}
