const {ElasticMigration} = require('elastic-migrate');

class M20210112140916_pre_operation_update extends ElasticMigration {
  async up() {
      await this.removeIndex('ticket721_operation');
  }

    async down() {
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
}

module.exports = M20210112140916_pre_operation_update
