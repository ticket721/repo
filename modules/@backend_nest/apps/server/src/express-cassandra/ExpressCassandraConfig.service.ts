import { Injectable } from '@nestjs/common';
import { types } from 'cassandra-driver';
import { ConfigService } from '@lib/common/config/Config.service';

/**
 * Service used to inject Elassandra configurations
 */
@Injectable()
export class ExpressCassandraConfigService {
    /**
     * Recovers the ConfigService
     *
     * @param config
     */
    constructor /* instanbul ignore next */(private readonly config: ConfigService) {}

    /**
     * Builds the configuration for the `user` keyspace
     */
    async createUserKeyspaceOptions(): Promise<any> {
        return {
            queryOptions: {
                consistency: types.consistencies.one,
            },
            clientOptions: {
                contactPoints: this.config.get('CASSANDRA_CONTACT_POINTS').split('+'),
                keyspace: 'ticket721',
                protocolOptions: {
                    port: parseInt(this.config.get('CASSANDRA_PORT'), 10),
                },
                queryOptions: {
                    consistency: 1,
                },
                elasticsearch: {
                    host: `${this.config.get('ELASTICSEARCH_PROTOCOL')}://${this.config.get(
                        'ELASTICSEARCH_HOST',
                    )}:${this.config.get('ELASTICSEARCH_PORT')}`,
                    apiVersion: '6.8',
                    sniffOnStart: false
                },
            },
            ormOptions: {
                udts: {
                    action: {
                        status: 'text',
                        name: 'text',
                        data: 'text',
                        type: 'text',
                        error: 'text',
                    },
                },
                createKeyspace: false,
                defaultReplicationStrategy: {
                    class: 'NetworkTopologyStrategy',
                    DC1: 1,
                },
                migration: 'safe',
                manageESIndex: true,
            },
        };
    }
}
