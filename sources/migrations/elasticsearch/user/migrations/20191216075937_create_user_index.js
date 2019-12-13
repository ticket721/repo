const {ElasticMigration} = require('elastic-migrate');

class M20191216075937_create_user_index extends ElasticMigration {
    async up() {
        // await this.createIndex(INDEX_NAME, SETTINGS)
        // await this.removeIndex(INDEX_NAME)
        // await this.addAlias(ALIAS_NAME, INDEX_NAME)
        // await this.removeAlias(ALIAS_NAME, INDEX_NAME)
        await this.createIndex('ticket721_user', 'ticket721');
        await this.putMapping('ticket721_user', 'user', {
            "user": {
                "discover": "^((?!password|wallet).*)"
            }
        });
    }

    async down() {
        await this.removeIndex('ticket721_user')
    }
}

module.exports = M20191216075937_create_user_index;
