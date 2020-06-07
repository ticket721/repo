const {ElasticMigration} = require('elastic-migrate');

class M20191216075937_initial_setup extends ElasticMigration {
    async up() {
        // await this.createIndex(INDEX_NAME, SETTINGS)
        // await this.removeIndex(INDEX_NAME)
        // await this.addAlias(ALIAS_NAME, INDEX_NAME)
        // await this.removeAlias(ALIAS_NAME, INDEX_NAME)

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

        await this.createIndex('ticket721_web3token', 'ticket721');
        await this.putMapping('ticket721_web3token', 'web3token', {
            "web3token": {
                "discover": ".*"
            }
        });
        await this.putSettings('ticket721_web3token',
            {
                index: {
                    synchronous_refresh: true
                }
            }
        );

        await this.createIndex('ticket721_right', 'ticket721');
        await this.putMapping('ticket721_right', 'right', {
            "right": {
                "discover": ".*"
            }
        });
        await this.putSettings('ticket721_right',
            {
                index: {
                    synchronous_refresh: true,
                    max_result_window: 2147483647
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

        await this.createIndex('ticket721_actionset', 'ticket721');
        await this.putMapping('ticket721_actionset', 'actionset', {
            "actionset": {
                "discover": "^((?!links).*)",
                "properties": {
                    "links": {
                        "type": "nested",
                        "cql_collection": "list",
                        "properties": {
                            "id": {
                                "cql_collection": "singleton",
                                "type": "keyword"
                            },
                            "type": {
                                "cql_collection": "singleton",
                                "type": "text"
                            }
                        }
                    }
                }
            }
        });
        await this.putSettings('ticket721_actionset',
            {
                index: {
                    synchronous_refresh: true
                }
            }
        );

        await this.createIndex('ticket721_date', 'ticket721');
        await this.putMapping('ticket721_date', 'date', {
            "date": {
                "discover": "^((?!(location|metadata)).*)",
                "properties": {
                    "location": {
                        "type": "nested",
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
                        "type": "nested",
                        "cql_collection": "singleton",
                        "properties": {
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

        await this.createIndex('ticket721_tx', 'ticket721');
        await this.putMapping('ticket721_tx', 'tx', {
            "tx": {
                "discover": ".*"
            }
        });
        
        await this.createIndex('ticket721_global', 'ticket721');
        await this.putMapping('ticket721_global', 'global', {
            "global": {
                "discover": ".*"
            }
        });

        await this.createIndex('ticket721_evmeventset', 'ticket721');
        await this.putMapping('ticket721_evmeventset', 'evmeventset', {
            "evmeventset": {
                "discover": ".*"
            }
        });
        await this.putSettings('ticket721_evmeventset',
            {
                index: {
                    synchronous_refresh: true
                }
            }
        );
        
        await this.createIndex('ticket721_evmblockrollback', 'ticket721');
        await this.putMapping('ticket721_evmblockrollback', 'evmblockrollback', {
            "evmblockrollback": {
                "discover": ".*"
            }
        });
        await this.putSettings('ticket721_evmblockrollback',
            {
                index: {
                    synchronous_refresh: true
                }
            }
        );
        
        await this.createIndex('ticket721_gemorder', 'ticket721');
        await this.putMapping('ticket721_gemorder', 'gemorder', {
            "gemorder": {
                "discover": ".*"
            }
        });
        await this.putSettings('ticket721_gemorder',
            {
                index: {
                    synchronous_refresh: true
                }
            }
        );
        
        await this.createIndex('ticket721_striperesource', 'ticket721');
        await this.putMapping('ticket721_striperesource', 'striperesource', {
            "striperesource": {
                "discover": ".*"
            }
        });
        await this.putSettings('ticket721_striperesource',
            {
                index: {
                    synchronous_refresh: true
                }
            }
        );
        
        await this.createIndex('ticket721_metadata', 'ticket721');
        await this.putMapping('ticket721_metadata', 'metadata', {
            "metadata": {
                "discover": ".*"
            }
        });
        
        await this.createIndex('ticket721_authorization', 'ticket721');
        await this.putMapping('ticket721_authorization', 'authorization', {
            "authorization": {
                "discover": ".*"
            }
        });
        await this.putSettings('ticket721_authorization',
            {
                index: {
                    synchronous_refresh: true
                }
            }
        );


    }

    async down() {
        await this.removeIndex('ticket721_user');
        await this.removeIndex('ticket721_image');
        await this.removeIndex('ticket721_web3token');
        await this.removeIndex('ticket721_actionset');
        await this.removeIndex('ticket721_right');
        await this.removeIndex('ticket721_date');
        await this.removeIndex('ticket721_event');
        await this.removeIndex('ticket721_tx');
        await this.removeIndex('ticket721_global');
        await this.removeIndex('ticket721_evmeventset');
        await this.removeIndex('ticket721_evmblockrollback');
        await this.removeIndex('ticket721_gemorder');
        await this.removeIndex('ticket721_striperesource');
        await this.removeIndex('ticket721_category');
        await this.removeIndex('ticket721_metadata');
        await this.removeIndex('ticket721_authorization');
    }
}

module.exports = M20191216075937_initial_setup;
