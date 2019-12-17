import { use, expect }     from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { ConfigService }   from './Config.service';

use(chaiAsPromised);

describe('ConfigService', () => {

    it('build with invalid env', () => {

        expect(() => {
                const configService = new ConfigService();
            },
        ).to.be.throw('Config validation error');


    });

    it('build with valid env', () => {

        const old_env = process.env;

        process.env = {
            CASSANDRA_CONTACT_POINTS: '127.0.0.1',
            CASSANDRA_PORT: '1234',
            API_PORT: '3000',
            ELASTICSEARCH_HOST: '127.0.0.1',
            ELASTICSEARCH_PORT: '4321',
            JWT_SECRET: 'salut'
        };

        const configService = new ConfigService();
        expect(configService.get('API_PORT')).to.equal('3000');

        process.env = old_env;

    });
});
