const {ElasticMigration} = require('elastic-migrate');

class M20201105101935_add_venmas_state extends ElasticMigration {
    async up() {
        await this.createIndex('ticket721_venmas_map', 'ticket721');
        await this.putMapping('ticket721_venmas_map', 'venmas_map', {
            "venmas_map": {
                "discover": "^((?!(sections)).*)",
                "properties": {
                    "sections": {
                        "type": "nested",
                        "cql_collection": "list",
                        "properties": {
                            "id": {
                                "cql_collection": "singleton",
                                "type": "integer"
                            },
                            "type": {
                                "cql_collection": "singleton",
                                "type": "text"
                            },
                            "owner": {
                                "cql_collection": "singleton",
                                "type": "text"
                            },
                            "points": {
                                "cql_collection": "list",
                                "type": "nested",
                                "properties": {
                                    "x": {
                                        "cql_collection": "singleton",
                                        "type": "float"
                                    },
                                    "y": {
                                        "cql_collection": "singleton",
                                        "type": "float"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        await this.putSettings('ticket721_venmas_map',
            {
                index: {
                    synchronous_refresh: true
                }
            }
        );
    }

    async down() {
        await this.removeIndex('ticket721_venmas_map');
    }
}

module.exports = M20201105101935_add_venmas_state;
