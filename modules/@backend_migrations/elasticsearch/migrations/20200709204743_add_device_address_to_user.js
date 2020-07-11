const {ElasticMigration} = require('elastic-migrate');

class M20200709204743_add_device_address_to_user extends ElasticMigration {
    async up() {

        await this.putMapping('ticket721_user', 'user', {
            "user": {
                "discover": ".*",
                properties: {
                    password: {
                        type: "keyword",
                        index: false
                    },
                    device_address: {
                        type: "keyword",
                        index: true
                    }
                }
            }
        });

    }

    async down() {

        await this.removeIndex('ticket721_user');
        await this.createIndex('ticket721_user', 'ticket721');
        await this.putMapping('ticket721_user', 'user', {
            "user": {
                "discover": "^((?!(device_address)).*)",
                "properties": {
                    password: {
                        type: "keyword",
                        index: false
                    },
                }
            }
        });
        await this.putSettings('ticket721_actionset',
            {
                index: {
                    synchronous_refresh: true
                }
            }
        );

    }
}

module.exports = M20200709204743_add_device_address_to_user;
