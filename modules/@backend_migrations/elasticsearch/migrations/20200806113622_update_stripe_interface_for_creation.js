const { ElasticMigration } = require('elastic-migrate');

class M20200806113622_update_stripe_interface_for_creation extends ElasticMigration {
    async up() {

        await this.removeIndex('ticket721_stripe_interface');
        await this.createIndex('ticket721_stripe_interface', 'ticket721');
        await this.putMapping('ticket721_stripe_interface', 'stripe_interface', {
            "stripe_interface": {
                "discover": ".*",
                "properties": {
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

    async down() {
        await this.removeIndex('ticket721_stripe_interface');
        await this.createIndex('ticket721_stripe_interface', 'ticket721');
        await this.putMapping('ticket721_stripe_interface', 'stripe_interface', {
            "stripe_interface": {
                "discover": "^((?!(connect_account_current_deadline|connect_account_currently_due|connect_account_eventually_due|connect_account_past_due|connect_account_pending_verification|connect_account_errors|connect_account_disabled_reason|connect_account_external_accounts|connect_account_name|connect_account_type|connect_account_capabilities)).*)",
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
}

module.exports = M20200806113622_update_stripe_interface_for_creation;
