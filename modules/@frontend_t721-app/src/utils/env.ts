import { CoreEnv, CoreEnvSchema } from '@frontend/core/lib/utils/env';

// tslint:disable-next-line:no-empty-interface
export interface T721AppEnv extends CoreEnv {
}

export const T721AppEnvSchema = CoreEnvSchema.append({
}).unknown();

