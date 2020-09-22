const {ElasticMigration} = require('elastic-migrate');

class M20200806112200_update_stripe_interface_for_deletion extends ElasticMigration {
    async up() {

        await this.removeIndex('ticket721_stripe_interface');
        await this.createIndex('ticket721_stripe_interface', 'ticket721');
        await this.putMapping('ticket721_stripe_interface', 'stripe_interface', {
            "stripe_interface": {
                "discover": "^((?!(connect_account_business_type|connect_account_status)).*)",
                "properties": {}
            }
        });
        await this.putSettings('ticket721_stripe_interface',
            {
                index: {
                    synchronous_refresh: true
                }
            }
        );

    }

    async down() {

        await this.removeIndex('ticket721_stripe_interface');
        await this.createIndex('ticket721_stripe_interface', 'ticket721');
        await this.putMapping('ticket721_stripe_interface', 'stripe_interface', {
            "stripe_interface": {
                "discover": ".*",
                "properties": {
                    "connect_account_business_type": {
                        type: 'keyword',
                        index: true
                    },
                    "connect_account_status": {
                        type: 'keyword',
                        index: true
                    }
                }
            }
        });
        await this.putSettings('ticket721_stripe_interface',
            {
                index: {
                    synchronous_refresh: true
                }
            }
        );

    }
}

module.exports = M20200806112200_update_stripe_interface_for_deletion;
