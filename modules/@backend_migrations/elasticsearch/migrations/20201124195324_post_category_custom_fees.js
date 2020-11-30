const {ElasticMigration} = require('elastic-migrate');

class M20201124195324_post_category_custom_fees extends ElasticMigration {
  async up() {

      await this.removeIndex('ticket721_category');
      await this.createIndex('ticket721_category', 'ticket721');
      await this.putMapping('ticket721_category', 'category', {
          "category": {
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

    async down() {

    }
}

module.exports = M20201124195324_post_category_custom_fees;
