import Joi      from '@hapi/joi';

export interface T721AppEnv {
    REACT_APP_ETHEREUM_ENDPOINT_PROTOCOL: string;
    REACT_APP_ETHEREUM_ENDPOINT_HOST: string;
    REACT_APP_ETHEREUM_ENDPOINT_PORT: number;
    REACT_APP_ETHEREUM_ENDPOINT_PATH: string;
}

export const T721AppEnvSchema = Joi.object<T721AppEnv>({
    REACT_APP_ETHEREUM_ENDPOINT_PROTOCOL: Joi.string().required(),
    REACT_APP_ETHEREUM_ENDPOINT_HOST: Joi.string().required(),
    REACT_APP_ETHEREUM_ENDPOINT_PORT: Joi.number().required(),
    REACT_APP_ETHEREUM_ENDPOINT_PATH: Joi.string().optional(),
}).unknown();

