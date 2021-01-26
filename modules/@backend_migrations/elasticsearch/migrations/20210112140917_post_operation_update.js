const {ElasticMigration} = require('elastic-migrate');

class M20210112140917_post_operation_update extends ElasticMigration {
  async up() {
      await this.createIndex('ticket721_operation', 'ticket721');
      await this.putMapping('ticket721_operation', 'operation', {
          "operation": {
              "discover": ".*"
          }
      });
      await this.putSettings('ticket721_operation',
          {
              index: {
                  synchronous_refresh: true
              }
          }
      );
  }

    async down() {
        await this.removeIndex('ticket721_operation');
    }
}

module.exports = M20210112140917_post_operation_update
