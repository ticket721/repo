import { ConfigService } from './Config.service';

import * as Joi from '@hapi/joi';

export const Config: Joi.ObjectSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test', 'test-e2e', 'provision')
        .default('development'),

    API_PORT: Joi.number().default(3000),

    CASSANDRA_CONTACT_POINTS: Joi.string().required(),
    CASSANDRA_PORT: Joi.number().required(),

    ELASTICSEARCH_HOST: Joi.string().required(),
    ELASTICSEARCH_PORT: Joi.number().required(),
    ELASTICSEARCH_PROTOCOL: Joi.string().default('http'),

    JWT_SECRET: Joi.string().required(),
    HOSTNAME_PREFIX: Joi.optional(),
});

describe('Config Service', () => {
    it('build with invalid env', () => {
        expect(() => {
            new ConfigService(Config);
        }).toThrow('Config validation error');
    });

    it('build with valid env', () => {
        const old_env = process.env;

        process.env = {
            CASSANDRA_CONTACT_POINTS: '127.0.0.1',
            CASSANDRA_PORT: '1234',
            API_PORT: '3000',
            ELASTICSEARCH_HOST: '127.0.0.1',
            ELASTICSEARCH_PORT: '4321',
            JWT_SECRET: 'salut',
        };

        const configService = new ConfigService(Config);
        expect(configService.get('API_PORT')).toEqual('3000');

        process.env = old_env;
    });
});
