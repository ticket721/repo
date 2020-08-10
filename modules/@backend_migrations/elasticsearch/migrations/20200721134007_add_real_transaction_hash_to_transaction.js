const {ElasticMigration} = require('elastic-migrate');

class M20200721134007_add_real_transaction_hash_to_transaction extends ElasticMigration {
    async up() {

        await this.putMapping('ticket721_tx', 'tx', {
            "tx": {
                "discover": ".*",
                properties: {
                    real_transaction_hash: {
                        type: "keyword",
                        index: true
                    }
                }
            }
        });

    }

    async down() {

        await this.removeIndex('ticket721_tx');
        await this.createIndex('ticket721_tx', 'ticket721');
        await this.putMapping('ticket721_tx', 'tx', {
            "tx": {
                "discover": "^((?!(real_transaction_hash)).*)"
            }
        });

    }
}

module.exports = M20200721134007_add_real_transaction_hash_to_transaction;
