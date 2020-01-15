const {ElasticMigration} = require('elastic-migrate');

class M20191216075937_initial_setup extends ElasticMigration {
    async up() {
        // await this.createIndex(INDEX_NAME, SETTINGS)
        // await this.removeIndex(INDEX_NAME)
        // await this.addAlias(ALIAS_NAME, INDEX_NAME)
        // await this.removeAlias(ALIAS_NAME, INDEX_NAME)

        await this.createIndex('ticket721_user', 'ticket721');
        await this.putMapping('ticket721_user', 'user', {
            "user": {
                "discover": ".*",
                properties: {
                    password: {
                        type: "keyword",
                        index: false
                    },
                    wallet: {
                        type: "keyword",
                        index: false
                    }
                }
            }
        });
        await this.putSettings('ticket721_user',
            {
                index: {
                    synchronous_refresh: true
                }
            }
        );

        await this.createIndex('ticket721_web3token', 'ticket721');
        await this.putMapping('ticket721_web3token', 'web3token', {
            "web3token": {
                "discover": ".*"
            }
        });
        await this.putSettings('ticket721_web3token',
            {
                index: {
                    synchronous_refresh: true
                }
            }
        );

        await this.createIndex('ticket721_actionset', 'ticket721');
        await this.putMapping('ticket721_actionset', 'actionset', {
            "actionset": {
                "discover": ".*"
            }
        });

        await this.createIndex('ticket721_date', 'ticket721');
        await this.putMapping('ticket721_date', 'date', {
            "date": {
                "discover": "^((?!location).*)",
                "properties": {
                    "location": {
                        "type": "geo_point",
                        "cql_collection": "singleton"
                    }
                }
            }
        });

        await this.createIndex('ticket721_event', 'ticket721');
        await this.putMapping('ticket721_event', 'event', {
            "event": {
                "discover": ".*"
            }
        });
    }

    async down() {
        await this.removeIndex('ticket721_user');
        await this.removeIndex('ticket721_web3token');
        await this.removeIndex('ticket721_actionset');
        await this.removeIndex('ticket721_date');
        await this.removeIndex('ticket721_event');
    }
}

module.exports = M20191216075937_initial_setup;
