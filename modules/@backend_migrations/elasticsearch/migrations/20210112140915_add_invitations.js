const {ElasticMigration} = require('elastic-migrate');

class M20210112140915_add_invitations extends ElasticMigration {
  async up() {
      await this.createIndex('ticket721_invitation', 'ticket721');
      await this.putMapping('ticket721_invitation', 'invitation', {
          "invitation": {
              "discover": ".*"
          }
      });
      await this.putSettings('ticket721_invitation',
          {
              index: {
                  synchronous_refresh: true
              }
          }
      );
  }

    async down() {
        await this.removeIndex('ticket721_invitation');
    }
}

module.exports = M20210112140915_add_invitations;
