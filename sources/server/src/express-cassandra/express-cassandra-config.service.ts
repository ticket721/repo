import { CassandraType, ExpressCassandraModuleOptions } from '@iaminfinity/express-cassandra';
import { Injectable }                                   from '@nestjs/common';
import { ConfigService }                                from '../config/config.service';
import { WinstonLoggerService }                         from '../logger/logger.service';

/**
 * Service used to inject Elassandra configurations
 */
@Injectable()
export class ExpressCassandraConfigService {

    /**
     * ConfigService to recover Cassandra related variables
     */
    config: ConfigService;

    /**
     * Recovers the ConfigService
     *
     * @param config
     */
    constructor(config: ConfigService) {
        this.config = config;
    }

    /**
     * Builds the configuration for the `user` keyspace
     */
    async createUserKeyspaceOptions(): Promise<any> {
        return {
            clientOptions: {
                contactPoints: this.config.get('CASSANDRA_CONTACT_POINTS').split('+'),
                keyspace: 'ticket721',
                protocolOptions: {
                    port: parseInt(this.config.get('CASSANDRA_PORT')),
                },
                queryOptions: {
                    consistency: 1,
                },
                elasticsearch: {
                    host: `${this.config.get('ELASTICSEARCH_PROTOCOL')}://${this.config.get('ELASTICSEARCH_HOST')}:${this.config.get('ELASTICSEARCH_PORT')}`,
                    apiVersion: '6.8',
                    sniffOnStart: false
                },
            },
            ormOptions: {
                createKeyspace: false,
                defaultReplicationStrategy: {
                    class: 'NetworkTopologyStrategy',
                    DC1: 1
                },
                migration: 'safe',
                manageESIndex: true
            },
        };
    }

}
