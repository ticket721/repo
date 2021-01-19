const {ElasticMigration} = require('elastic-migrate');

class M20201225112440_post_add_user_avatar extends ElasticMigration {
    async up() {
        await this.removeIndex('ticket721_user');
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
        await this.putSettings('ticket721_purchase',
            {
                index: {
                    synchronous_refresh: true
                }
            }
        );

    }

    async down() {
        await this.removeIndex('ticket721_user');
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
    }
}

module.exports = M20201225112440_post_add_user_avatar;
