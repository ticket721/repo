import Joi from '@hapi/joi';

export interface CoreEnv {
    REACT_APP_T721_SERVER_HOST: string;
    REACT_APP_T721_SERVER_PORT: number;
    REACT_APP_T721_SERVER_PROTOCOL: number;
    REACT_APP_ETHEREUM_ENDPOINT_PROTOCOL: string;
    REACT_APP_ETHEREUM_ENDPOINT_HOST: string;
    REACT_APP_ETHEREUM_ENDPOINT_PORT: number;
    REACT_APP_ETHEREUM_ENDPOINT_PATH: string;
}

export const CoreEnvSchema = Joi.object<CoreEnv>({
    REACT_APP_T721_SERVER_HOST: Joi.string().required(),
    REACT_APP_T721_SERVER_PORT: Joi.string().required(),
    REACT_APP_T721_SERVER_PROTOCOL: Joi.string().required(),
}).unknown();
