const {ElasticMigration} = require('elastic-migrate');

class M20200804131159_add_user_admin_flag extends ElasticMigration {
  async up() {

      await this.putMapping('ticket721_user', 'user', {
          "user": {
              "discover": ".*",
              properties: {
                  password: {
                      type: "keyword",
                      index: false
                  },
                  admin: {
                      type: "boolean",
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
              "discover": "^((?!(admin)).*)".toString(),
              properties: {
                  password: {
                      type: "keyword",
                      index: false
                  },
              }
          }
      });

  }
}

module.exports = M20200804131159_add_user_admin_flag;
