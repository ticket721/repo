import Joi from '@hapi/joi';

export interface CoreEnv {
    REACT_APP_T721_SERVER_HOST: string;
    REACT_APP_T721_SERVER_PORT: number;
    REACT_APP_T721_SERVER_PROTOCOL: number;
    REACT_APP_SELF: string;
    REACT_APP_BUG_REPORT_LINK: string;
    REACT_APP_ERROR_THRESHOLD: number;
    REACT_APP_GOOGLE_AUTH_CLIENT_ID: string;

    REACT_APP_GA_ID?: string;
}

export const CoreEnvSchema = Joi.object<CoreEnv>({
    REACT_APP_T721_SERVER_HOST: Joi.string().required(),
    REACT_APP_T721_SERVER_PORT: Joi.number().required(),
    REACT_APP_T721_SERVER_PROTOCOL: Joi.string().required(),
    REACT_APP_SELF: Joi.string().required(),
    REACT_APP_BUG_REPORT_LINK: Joi.string().required(),
    REACT_APP_ERROR_THRESHOLD: Joi.number().required(),
    REACT_APP_GOOGLE_AUTH_CLIENT_ID: Joi.string().required(),

    REACT_APP_GA_ID: Joi.string().optional(),
}).unknown();
