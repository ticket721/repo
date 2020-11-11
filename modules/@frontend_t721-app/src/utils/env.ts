import { CoreEnv, CoreEnvSchema } from '@frontend/core/lib/utils/env';
import Joi from '@hapi/joi';

export interface T721AppEnv extends CoreEnv {
    REACT_APP_STRIPE_API_KEY: string;
    REACT_APP_APPSTORE_LINK: string;
    REACT_APP_PLAYSTORE_LINK: string;
}

export const T721AppEnvSchema = (CoreEnvSchema as Joi.ObjectSchema<T721AppEnv>).append({
    REACT_APP_STRIPE_API_KEY: Joi.string().required(),
    REACT_APP_APPSTORE_LINK: Joi.string().required(),
    REACT_APP_PLAYSTORE_LINK: Joi.string().required()
}).unknown();

