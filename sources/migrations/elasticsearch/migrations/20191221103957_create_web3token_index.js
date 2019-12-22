const {ElasticMigration} = require('elastic-migrate');

class M20191221103957_create_web3token_index extends ElasticMigration {
    async up() {
        await this.createIndex('ticket721_web3token', 'ticket721');
        await this.closeIndex('ticket721_web3token');
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
        await this.openIndex('ticket721_web3token');
    }

    async down() {
        await this.removeIndex('ticket721_web3token')
    }
}

module.exports = M20191221103957_create_web3token_index;
