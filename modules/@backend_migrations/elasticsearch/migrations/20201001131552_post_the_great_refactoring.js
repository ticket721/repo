const {ElasticMigration} = require('elastic-migrate');

class M20201001131552_post_the_great_refactoring extends ElasticMigration {
    async up() {
        await this.createIndex('ticket721_user', 'ticket721');
        await this.putMapping('ticket721_user', 'user', {
            "user": {
                "discover": ".*",
                properties: {
                    password: {
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

        await this.createIndex('ticket721_event', 'ticket721');
        await this.putMapping('ticket721_event', 'event', {
            "event": {
                "discover": ".*"
            }
        });
        await this.putSettings('ticket721_event',
            {
                index: {
                    synchronous_refresh: true
                }
            }
        );
    }

    async down() {
        await this.removeIndex('ticket721_user');
        await this.removeIndex('ticket721_event');
    }
}

module.exports = M20201001131552_post_the_great_refactoring;
