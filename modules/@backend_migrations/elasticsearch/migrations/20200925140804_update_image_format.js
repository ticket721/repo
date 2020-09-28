const {ElasticMigration} = require('elastic-migrate');

class M20200925140804_update_image_format extends ElasticMigration {

  async up() {
      await this.removeIndex('ticket721_image');
  }

  async down() {

      await this.createIndex('ticket721_image', 'ticket721');
      await this.putMapping('ticket721_image', 'image', {
          "image": {
              "discover": ".*",
          }
      });
      await this.putSettings('ticket721_image',
          {
              index: {
                  synchronous_refresh: true
              }
          }
      );

  }

}

module.exports = M20200925140804_update_image_format;
