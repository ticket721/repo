import { CoreEnv, CoreEnvSchema } from '@frontend/core/lib/utils/env';
import Joi from '@hapi/joi';

export interface StaffAppEnv extends CoreEnv {
    REACT_APP_T721_ORGANIZER_URL: string;
    REACT_APP_SENTRY_DSN: string;
}

export const StaffAppEnvSchema = (CoreEnvSchema as Joi.ObjectSchema<StaffAppEnv>).append({
    REACT_APP_T721_ORGANIZER_URL: Joi.string().required(),
    REACT_APP_SENTRY_DSN: Joi.string().uri().optional()
}).unknown();

