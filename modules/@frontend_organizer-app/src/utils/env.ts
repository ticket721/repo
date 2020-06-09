import { CoreEnv, CoreEnvSchema } from '@frontend/core/lib/utils/env';

// tslint:disable-next-line:no-empty-interface
export interface OrganizerAppEnv extends CoreEnv {
}

export const OrganizerAppEnvSchema = CoreEnvSchema.append({
}).unknown();

