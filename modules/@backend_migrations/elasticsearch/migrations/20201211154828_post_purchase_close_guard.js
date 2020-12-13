const {ElasticMigration} = require('elastic-migrate');

class M20201211154828_post_purchase_close_guard extends ElasticMigration {
  async up() {
      await this.removeIndex('ticket721_purchase');
      await this.createIndex('ticket721_purchase', 'ticket721');
      await this.putMapping('ticket721_purchase', 'purchase', {
          "purchase": {
              "discover": ".*"
          }
      });
      await this.putSettings('ticket721_category',
          {
              index: {
                  synchronous_refresh: true
              }
          }
      );
  }

    async down() {}
}

module.exports = M20201211154828_post_purchase_close_guard;
