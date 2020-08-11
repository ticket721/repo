const {ElasticMigration} = require('elastic-migrate');

class M20200728121356_add_stripe_interface extends ElasticMigration {
  async up() {
      await this.createIndex('ticket721_stripe_interface', 'ticket721');
      await this.putMapping('ticket721_stripe_interface', 'stripe_interface', {
          "stripe_interface": {
              "discover": ".*"
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
    }
}

module.exports = M20200728121356_add_stripe_interface;
