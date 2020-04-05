import { StatusCodes, StatusNames } from '@lib/common/utils/codes.value';
import { DECORATORS } from '@nestjs/swagger/dist/constants';

/**
 * Decorator to aggregate the declared returned codes
 *
 * @param options
 */
/* istanbul ignore next */
export function ApiResponses(options: StatusCodes[]) {
    const groupedMetadata = {};

    for (const code of options) {
        groupedMetadata[code] = {
            description: StatusNames[code],
        };
    }

    return (target, key, descriptor) => {
        if (descriptor) {
            const descResponses = Reflect.getMetadata(DECORATORS.API_RESPONSE, descriptor.value) || {};
            Reflect.defineMetadata(
                DECORATORS.API_RESPONSE,
                Object.assign(Object.assign({}, descResponses), groupedMetadata),
                descriptor.value,
            );
            return descriptor;
        }
        const responses = Reflect.getMetadata(DECORATORS.API_RESPONSE, target) || {};
        Reflect.defineMetadata(
            DECORATORS.API_RESPONSE,
            Object.assign(Object.assign({}, responses), groupedMetadata),
            target,
        );
        return target;
    };
}
