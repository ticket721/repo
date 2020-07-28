const {ElasticMigration} = require('elastic-migrate');

class M20200715201757_add_missing_ticket_mapping_and_metadata_sync_settings extends ElasticMigration {
    async up() {

        try {
            await this.removeIndex('ticket721_ticket');
        } catch (e) {
            if (e.message.indexOf('[index_not_found_exception] no such index') === -1) {
                throw e;
            } else {
                console.log('Cannot remove ticket721_ticket');
            }
        }
        await this.createIndex('ticket721_ticket', 'ticket721');
        await this.putMapping('ticket721_ticket', 'ticket', {
            "ticket": {
                "discover": ".*"
            }
        });
        await this.putSettings('ticket721_ticket',
            {
                index: {
                    synchronous_refresh: true
                }
            }
        );

        await this.putSettings('ticket721_metadata',
            {
                index: {
                    synchronous_refresh: true
                }
            }
        );
    }

    async down() {

    }
}

module.exports = M20200715201757_add_missing_ticket_mapping_and_metadata_sync_settings;
