const {ElasticMigration} = require('elastic-migrate');

class M20201105101935_add_venmas_state extends ElasticMigration {
    async up() {
        await this.createIndex('ticket721_venmas_map', 'ticket721');
        await this.putMapping('ticket721_venmas_map', 'venmas_map', {
            "venmas_map": {
                "discover": ".*"
            }
        });
        await this.putSettings('ticket721_venmas_map',
            {
                index: {
                    synchronous_refresh: true
                }
            }
        );
    }

    async down() {
        await this.removeIndex('ticket721_venmas_map');
    }
}

module.exports = M20201105101935_add_venmas_state;
