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

    it('get current role', () => {
        const old_env = process.env;

        process.env = {
            NODE_ENV: 'development',
            CASSANDRA_CONTACT_POINTS: '127.0.0.1',
            CASSANDRA_PORT: '1234',
            API_PORT: '3000',
            ELASTICSEARCH_HOST: '127.0.0.1',
            ELASTICSEARCH_PORT: '4321',
            JWT_SECRET: 'salut',
        };

        const configService = new ConfigService(Config);
        expect(configService.getRole()).toEqual(0);

        process.env = old_env;
    });

    it('get current role in production', () => {
        const old_env = process.env;

        process.env = {
            NODE_ENV: 'production',
            CASSANDRA_CONTACT_POINTS: '127.0.0.1',
            CASSANDRA_PORT: '1234',
            API_PORT: '3000',
            ELASTICSEARCH_HOST: '127.0.0.1',
            ELASTICSEARCH_PORT: '4321',
            JWT_SECRET: 'salut',
        };

        const configService = new ConfigService(Config);

        expect((): void => {
            configService.getRole();
        }).toThrow('Hostname is required to get current role');

        process.env = old_env;
    });

    it('get current role with missing HOSTNAME_PREFIX', () => {
        const old_env = process.env;

        process.env = {
            NODE_ENV: 'production',
            CASSANDRA_CONTACT_POINTS: '127.0.0.1',
            CASSANDRA_PORT: '1234',
            API_PORT: '3000',
            ELASTICSEARCH_HOST: '127.0.0.1',
            ELASTICSEARCH_PORT: '4321',
            JWT_SECRET: 'salut',
        };

        const configService = new ConfigService(Config);

        expect((): void => {
            configService.getRole('test-0');
        }).toThrow(
            'Config validation error: in NODE_ENV=production, HOSTNAME_PREFIX is required',
        );

        process.env = old_env;
    });

    it('get current role with invalid HOSTNAME_PREFIX', () => {
        const old_env = process.env;

        process.env = {
            NODE_ENV: 'production',
            CASSANDRA_CONTACT_POINTS: '127.0.0.1',
            CASSANDRA_PORT: '1234',
            API_PORT: '3000',
            ELASTICSEARCH_HOST: '127.0.0.1',
            ELASTICSEARCH_PORT: '4321',
            JWT_SECRET: 'salut',
            HOSTNAME_PREFIX: 'salut',
        };

        const configService = new ConfigService(Config);

        expect((): void => {
            configService.getRole('test-0');
        }).toThrow(
            'Invalid HOSTNAME_PREFIX value, cannot be found in real hostname: prefix salut hostname test-0',
        );

        process.env = old_env;
    });

    it('get current role with invalid hostname', () => {
        const old_env = process.env;

        process.env = {
            NODE_ENV: 'production',
            CASSANDRA_CONTACT_POINTS: '127.0.0.1',
            CASSANDRA_PORT: '1234',
            API_PORT: '3000',
            ELASTICSEARCH_HOST: '127.0.0.1',
            ELASTICSEARCH_PORT: '4321',
            JWT_SECRET: 'salut',
            HOSTNAME_PREFIX: 'test',
        };

        const configService = new ConfigService(Config);

        expect((): void => {
            configService.getRole('test-x');
        }).toThrow(
            'Invalid hostname configuration: got hostname test-x, while expecting something like test-ID',
        );

        process.env = old_env;
    });

    it('get current role with hostname test-0', () => {
        const old_env = process.env;

        process.env = {
            NODE_ENV: 'production',
            CASSANDRA_CONTACT_POINTS: '127.0.0.1',
            CASSANDRA_PORT: '1234',
            API_PORT: '3000',
            ELASTICSEARCH_HOST: '127.0.0.1',
            ELASTICSEARCH_PORT: '4321',
            JWT_SECRET: 'salut',
            HOSTNAME_PREFIX: 'test',
        };

        const configService = new ConfigService(Config);

        const idx = configService.getRole('test-0');

        expect(idx).toEqual(0);

        process.env = old_env;
    });

    it('get current role with hostname test-1', () => {
        const old_env = process.env;

        process.env = {
            NODE_ENV: 'production',
            CASSANDRA_CONTACT_POINTS: '127.0.0.1',
            CASSANDRA_PORT: '1234',
            API_PORT: '3000',
            ELASTICSEARCH_HOST: '127.0.0.1',
            ELASTICSEARCH_PORT: '4321',
            JWT_SECRET: 'salut',
            HOSTNAME_PREFIX: 'test',
        };

        const configService = new ConfigService(Config);

        const idx = configService.getRole('test-1');

        expect(idx).toEqual(1);

        process.env = old_env;
    });
});
