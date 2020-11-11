const {ElasticMigration} = require('elastic-migrate');

class M20201001131232_the_great_refactoring extends ElasticMigration {
    async up() {
        await this.removeIndex('ticket721_user');
        await this.removeIndex('ticket721_event');
        await this.removeIndex('ticket721_date');
        await this.removeIndex('ticket721_category');
        await this.removeIndex('ticket721_ticket');
    }

    async down() {

        await this.createIndex('ticket721_user', 'ticket721');
        await this.putMapping('ticket721_user', 'user', {
            "user": {
                "discover": ".*",
                properties: {
                    password: {
                        type: "keyword",
                        index: false
                    }
                }
            }
        });
        await this.putSettings('ticket721_user',
            {
                index: {
                    synchronous_refresh: true
                }
            }
        );

        await this.createIndex('ticket721_event', 'ticket721');
        await this.putMapping('ticket721_event', 'event', {
            "event": {
                "discover": ".*"
            }
        });
        await this.putSettings('ticket721_event',
            {
                index: {
                    synchronous_refresh: true
                }
            }
        );

        await this.createIndex('ticket721_date', 'ticket721');
        await this.putMapping('ticket721_date', 'date', {
            "date": {
                "discover": "^((?!(location|metadata|timestamps)).*)",
                "properties": {
                    "location": {
                        "cql_collection": "singleton",
                        "properties": {
                            "location": {
                                "type": "geo_point",
                                "cql_collection": "singleton"
                            },
                            "location_label": {
                                "cql_collection": "singleton",
                                "type": "text"
                            },
                            "assigned_city": {
                                "cql_collection": "singleton",
                                "type": "integer"
                            }
                        }
                    },
                    "metadata": {
                        "cql_collection": "singleton",
                        "properties": {
                            "signature_colors": {
                                "cql_collection": "list",
                                "type": "text"
                            },
                            "avatar": {
                                "cql_collection": "singleton",
                                "type": "keyword"
                            },
                            "name": {
                                "cql_collection": "singleton",
                                "type": "text"
                            },
                            "description": {
                                "cql_collection": "singleton",
                                "type": "text"
                            },
                            "tags": {
                                "cql_collection": "list",
                                "type": "text"
                            }
                        }
                    },
                    "timestamps": {
                        "cql_collection": "singleton",
                        "properties": {
                            "event_begin": {
                                "type": "date",
                                "cql_collection": "singleton"
                            },
                            "event_end": {
                                "type": "date",
                                "cql_collection": "singleton"
                            }
                        }
                    }
                }
            }
        });
        await this.putSettings('ticket721_date',
            {
                index: {
                    synchronous_refresh: true
                }
            }
        );

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

        await this.createIndex('ticket721_ticket', 'ticket721');
        await this.putMapping('ticket721_ticket', 'ticket', {
            "ticket": {
                "discover": ".*"
            }
        });
        await this.putSettings('ticket721_ticket',
            {
                index: {
                    synchronous_refresh: true
                }
            }
        );
    }
}

module.exports = M20201001131232_the_great_refactoring;
