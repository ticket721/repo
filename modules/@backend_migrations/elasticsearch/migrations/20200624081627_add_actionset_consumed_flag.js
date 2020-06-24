const {ElasticMigration} = require('elastic-migrate');

class M20200624081627_add_actionset_consumed_flag extends ElasticMigration {
    async up() {

        await this.putMapping('ticket721_actionset', 'actionset', {
            "actionset": {
                "discover": "^((?!(links)).*)",
                "properties": {
                    "links": {
                        "type": "nested",
                        "cql_collection": "list",
                        "properties": {
                            "id": {
                                "cql_collection": "singleton",
                                "type": "keyword"
                            },
                            "type": {
                                "cql_collection": "singleton",
                                "type": "text"
                            }
                        }
                    },
                    consumed: {
                        type: 'boolean',
                        index: true
                    }
                }
            }
        });

    }

    async down() {

        await this.removeIndex('ticket721_actionset');
        await this.createIndex('ticket721_actionset', 'ticket721');
        await this.putMapping('ticket721_actionset', 'actionset', {
            "actionset": {
                "discover": "^((?!(links|consumed)).*)",
                "properties": {
                    "links": {
                        "type": "nested",
                        "cql_collection": "list",
                        "properties": {
                            "id": {
                                "cql_collection": "singleton",
                                "type": "keyword"
                            },
                            "type": {
                                "cql_collection": "singleton",
                                "type": "text"
                            }
                        }
                    }
                }
            }
        });
        await this.putSettings('ticket721_actionset',
            {
                index: {
                    synchronous_refresh: true
                }
            }
        );

    }
}

module.exports = M20200624081627_add_actionset_consumed_flag;
