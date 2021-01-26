import { CoreEnv, CoreEnvSchema } from '@frontend/core/lib/utils/env';
import Joi from '@hapi/joi';

export interface OrganizerAppEnv extends CoreEnv {
    REACT_APP_STRIPE_API_KEY: string;
    REACT_APP_SENTRY_DSN: string;
    REACT_APP_USER_URL: string;
}

export const OrganizerAppEnvSchema = (CoreEnvSchema as Joi.ObjectSchema<OrganizerAppEnv>).append({
    REACT_APP_STRIPE_API_KEY: Joi.string().required(),
    REACT_APP_SENTRY_DSN: Joi.string().uri().optional(),
    REACT_APP_USER_URL: Joi.string().uri().required()
}).unknown();
