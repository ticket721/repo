const {ElasticMigration} = require('elastic-migrate');

class M20200607165047_create_stripe_customer_token extends ElasticMigration {
    async up() {

        await this.putMapping('ticket721_user', 'user', {
            "user": {
                "discover": ".*",
                properties: {
                    password: {
                        type: "keyword",
                        index: false
                    },
                    stripe_customer_token: {
                        type: 'keyword',
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
                "discover": "^((?!(stripe_customer_token)).*)",
                properties: {
                    password: {
                        type: "keyword",
                        index: false
                    }
                }
            }
        });

    }
}

module.exports = M20200607165047_create_stripe_customer_token;
