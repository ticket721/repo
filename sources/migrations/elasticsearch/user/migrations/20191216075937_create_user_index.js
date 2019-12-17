const {ElasticMigration} = require('elastic-migrate');

class M20191216075937_create_user_index extends ElasticMigration {
    async up() {
        // await this.createIndex(INDEX_NAME, SETTINGS)
        // await this.removeIndex(INDEX_NAME)
        // await this.addAlias(ALIAS_NAME, INDEX_NAME)
        // await this.removeAlias(ALIAS_NAME, INDEX_NAME)
        await this.createIndex('ticket721_user', 'ticket721');
        await this.closeIndex('ticket721_user');
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
        await this.openIndex('ticket721_user');
    }

    async down() {
        await this.removeIndex('ticket721_user')
    }
}

module.exports = M20191216075937_create_user_index;
