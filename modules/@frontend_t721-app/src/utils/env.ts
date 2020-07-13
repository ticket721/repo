import { CoreEnv, CoreEnvSchema } from '@frontend/core/lib/utils/env';
import Joi from '@hapi/joi';

// tslint:disable-next-line:no-empty-interface
export interface T721AppEnv extends CoreEnv {
    REACT_APP_STRIPE_API_KEY: string;
    REACT_APP_ETHERSCAN_URL: string;
}

export const T721AppEnvSchema = (CoreEnvSchema as Joi.ObjectSchema<T721AppEnv>).append({
    REACT_APP_STRIPE_API_KEY: Joi.string().required(),
    REACT_APP_ETHERSCAN_URL: Joi.string().required(),
}).unknown();

