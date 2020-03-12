
var migration1576415205 = {
    up : async function (db, handler) {

        const user_table_creation = {
            query: `CREATE TABLE ticket721.user ( 
                    id UUID PRIMARY KEY, 
                    email text,
                    username text,
                    password text,
                    type text,
                    wallet text,
                    address text,
                    role text,
                    valid boolean,
                    locale text
                    );`,
            params: []
        };

        const web3token_table_creation = {
            query: `CREATE TABLE ticket721.web3token ( 
                    timestamp bigint,
                    address text,
                    PRIMARY KEY((timestamp, address))
                    );`,
            params: []
        };

        const image_table_creation = {
            query: `CREATE TABLE ticket721.image (
                    id UUID PRIMARY KEY,
                    mimetype text,
                    size int,
                    encoding text,
                    hash text,
                    links int,
                    created_at timestamp,
                    updated_at timestamp,
                    );`,
            params: []
        };

        const action_type_creation = {
            query: `CREATE TYPE ticket721.action (
                    status text,
                    name text,
                    data text,
                    type text,
                    error text
                    );`,
            params: []
        };

        const actionset_table_creation = {
            query: `CREATE TABLE ticket721.actionset (
                    id UUID PRIMARY KEY,
                    owner UUID,
                    current_action int,
                    current_status text,
                    name text,
                    actions list<frozen<ticket721.action>>,
                    created_at timestamp,
                    updated_at timestamp,
                    dispatched_at timestamp,
                    );`,
            params: []
        };

        const geo_point_type_creation = {
            query: `CREATE TYPE ticket721.geo_point (
                    lat double,
                    lon double
                    );`,
            params: []
        };

        const price_type_creation = {
            query: `CREATE TYPE ticket721.price (
                        currency text,
                        value text,
                        log_value double
                    );`,
            params: []
        };

        const category_type_creation = {
            query: `CREATE TYPE ticket721.category (
                        group_id text,
                        category_name text,
                        category_index int,
                        sale_begin timestamp,
                        sale_end timestamp,
                        resale_begin timestamp,
                        resale_end timestamp,
                        scope text,
                        prices list<frozen<ticket721.price>>,
                        status text,
                        seats int
                    );`,
            params: []
        };

        const date_metadata_type_creation = {
            query: `CREATE TYPE ticket721.date_metadata (
                        name text
                    );`,
            params: []
        };

        const date_table_creation = {
            query: `CREATE TABLE ticket721.date (
                        id UUID PRIMARY KEY,
                        event_begin timestamp,
                        event_end timestamp,
                        location frozen<ticket721.geo_point>,
                        location_label text,
                        assigned_city int,
                        categories list<frozen<ticket721.category>>,
                        metadata frozen<ticket721.date_metadata>,
                        parent_id uuid,
                        parent_type text,
                        created_at timestamp,
                        updated_at timestamp
                    );`,
            params: []
        };

        const event_table_creation = {
            query: `CREATE TABLE ticket721.event (
                        id UUID PRIMARY KEY,
                        status text,
                        address text,
                        owner uuid,
                        admins list<uuid>,
                        dates list<uuid>,
                        categories list<frozen<ticket721.category>>,
                        name text,
                        description text,
                        avatar uuid,
                        banners list<uuid>,
                        group_id text,
                        created_at timestamp,
                        updated_at timestamp
                    );`,
            params: []
        };

        const tx_log_type_creation = {
            query: `CREATE TYPE ticket721.tx_log (
                        address text,
                        block_hash text,
                        block_number int,
                        data text,
                        log_index int,
                        removed boolean,
                        topics list<text>,
                        transaction_hash text,
                        transaction_index int,
                        id text
                    );`,
            params: []
        };

        const tx_table_creation = {
            query: `CREATE TABLE ticket721.tx (
                        transaction_hash text PRIMARY KEY,
                        confirmed boolean,
                        status boolean,
                        block_hash text,
                        block_number int,
                        transaction_index int,
                        from_ text,
                        to_ text,
                        contract_address text,
                        cumulative_gas_used text,
                        cumulative_gas_used_ln double,
                        gas_used text,
                        gas_used_ln double,
                        gas_price text,
                        gas_price_ln double,
                        logs list<frozen<ticket721.tx_log>>,
                        logs_bloom text,
                        created_at timestamp,
                        updated_at timestamp
                    );`,
            params: []
        };

        const global_table_creation = {
            query: `CREATE TABLE ticket721.global (
                        id text PRIMARY KEY,
                        block_number int,
                        processed_block_number int,
                        eth_eur_price int,
                        created_at timestamp,
                        updated_at timestamp
                    );`,
            params: []
        };

        const global_table_initial_document = {
            query: `INSERT INTO ticket721.global (
                        id, 
                        block_number, 
                        processed_block_number,
                        eth_eur_price, 
                        created_at, 
                        updated_at
                    ) values (
                        'global',
                        0,
                        0,
                        100000,
                        toTimeStamp(toDate(now())),
                        toTimeStamp(toDate(now()))
                    );`,
            params: []
        };

        const evm_event_type_creation = {
            query: `CREATE TYPE ticket721.evmevent (
                        return_values text,
                        raw_data text,
                        raw_topics list<text>,
                        event text,
                        signature text,
                        log_index int,
                        transaction_index int,
                        transaction_hash text,
                        block_hash text,
                        block_number int,
                        address text,
                    );`,
            params: []
        };

        const evm_eventset_table_creation = {
            query: `CREATE TABLE ticket721.evmeventset (
                        artifact_name text,
                        event_name text,
                        block_number int,
                        events list<frozen<ticket721.evmevent>>,
                        created_at timestamp,
                        updated_at timestamp,
                        PRIMARY KEY (artifact_name, event_name, block_number)
                    );`,
            params: []
        };

        const dry_response_type_creation = {
            query: `CREATE TYPE ticket721.dryresponse (
                        query text,
                        params list<text>
                    );`,
            params: []
        };

        const evm_block_rollback_table_creation = {
            query: `CREATE TABLE ticket721.evmblockrollback (
                        block_number int PRIMARY KEY,
                         rollback_queries list<frozen<ticket721.dryresponse>>,
                        created_at timestamp,
                        updated_at timestamp
                    );`,
            params: []
        };

        const gem__operation_status_type_creation = {
            query: `CREATE TYPE ticket721.gem__operation_status (
                        status text,
                        layer int,
                        dosojin text,
                        operation_list list<text>,
            );`,
            params: []
        };

        const gem__transfer_entity_status_type_creation = {
            query: `CREATE TYPE ticket721.gem__transfer_entity_status (
                        status text,
                        layer int,
                        dosojin text,
                        name text,
            );`,
            params: []
        };

        const gem__transfer_status_type_creation = {
            query: `CREATE TYPE ticket721.gem__transfer_status (
                        connector frozen<ticket721.gem__transfer_entity_status>,
                        receptacle frozen<ticket721.gem__transfer_entity_status>
            );`,
            params: []
        };
        
        const gem__payload_cost_type_creation = {
            query: `CREATE TYPE ticket721.gem__payload_cost (
                        value text,
                        scope text,
                        dosojin text,
                        entity_name text,
                        entity_type text,
                        layer int,
                        reason text
            );`,
            params: []
        };

        const gem__payload_type_creation = {
            query: `CREATE TYPE ticket721.gem__payload (
                    values text,
                    costs list<frozen<ticket721.gem__payload_cost>>
            );`,
            params: []
        };
        
        const gem__error_info_type_creation = {
            query: `CREATE TYPE ticket721.gem__error_info (
                        dosojin text,
                        entity_name text,
                        entity_type text,
                        layer int,
                        message text
            );`,
            params: []
        };
        
        const gem__route_history_type_creation = {
            query: `CREATE TYPE ticket721.gem__route_history (
                        layer int,
                        dosojin text,
                        entity_name text,
                        entity_type text,
                        count int
            );`,
            params: []
        };
        
        const gem_type_creation = {
            query: `CREATE TYPE ticket721.gem (
                        action_type text,
                        operation_status frozen<ticket721.gem__operation_status>,
                        transfer_status frozen<ticket721.gem__transfer_status>,
                        gem_status text,
                        gem_payload frozen<ticket721.gem__payload>,
                        error_info frozen<ticket721.gem__error_info>,
                        route_history list<frozen<ticket721.gem__route_history>>,
                        gem_data text,
                        refresh_timer int,
                    );`,
            params: []
        };

        const gem_order_table_creation = {
            query: `CREATE TABLE ticket721.gemorder (
                        id text PRIMARY KEY,
                        distribution_id bigint,
                        circuit_name text,
                        owner uuid,
                        initial_arguments text,
                        gem frozen<ticket721.gem>,
                        refresh_timer int,
                        initialized boolean,
                        created_at timestamp,
                        updated_at timestamp,
                    );`,
            params: []
        };

        const stripe_resource_table_creation = {
            query: `CREATE TABLE ticket721.striperesource (
                        id text PRIMARY KEY,
                        used_by uuid,
                        created_at timestamp,
                        updated_at timestamp,
                    );`,
            params: []
        };

        try {

            // Types first
            console.log('Action Type Creation');
            await db.execute(action_type_creation.query, action_type_creation.params, { prepare: true });

            console.log('GeoPoint Type Creation');
            await db.execute(geo_point_type_creation.query, geo_point_type_creation.params, { prepare: true });

            console.log('Price Type Creation');
            await db.execute(price_type_creation.query, price_type_creation.params, { prepare: true });

            console.log('Category Type Creation');
            await db.execute(category_type_creation.query, category_type_creation.params, { prepare: true });

            console.log('Date Metadata Type Creation');
            await db.execute(date_metadata_type_creation.query, date_metadata_type_creation.params, { prepare: true });

            console.log('Tx Log Type Creation');
            await db.execute(tx_log_type_creation.query, tx_log_type_creation.params, {prepare: true});

            console.log('EVM Event Type Creation');
            await db.execute(evm_event_type_creation.query, evm_event_type_creation.params, {prepare: true});

            console.log('Dry Response Type Creation');
            await db.execute(dry_response_type_creation.query, dry_response_type_creation.params, {prepare: true});

            console.log('Gem Operation Status Type Creation');
            await db.execute(gem__operation_status_type_creation.query, gem__operation_status_type_creation.params, {prepare: true});

            console.log('Gem Transfer Entity Status Type Creation');
            await db.execute(gem__transfer_entity_status_type_creation.query, gem__transfer_entity_status_type_creation.params, {prepare: true});

            console.log('Gem Transfer Status Type Creation');
            await db.execute(gem__transfer_status_type_creation.query, gem__transfer_status_type_creation.params, {prepare: true});

            console.log('Gem Payload Cost Type Creation');
            await db.execute(gem__payload_cost_type_creation.query, gem__payload_cost_type_creation.params, {prepare: true});

            console.log('Gem Payload Type Creation');
            await db.execute(gem__payload_type_creation.query, gem__payload_type_creation.params, {prepare: true});

            console.log('Gem Error Info Type Creation');
            await db.execute(gem__error_info_type_creation.query, gem__error_info_type_creation.params, {prepare: true});

            console.log('Gem Route History Type Creation');
            await db.execute(gem__route_history_type_creation.query, gem__route_history_type_creation.params, {prepare: true});

            console.log('Gem Type Creation');
            await db.execute(gem_type_creation.query, gem_type_creation.params, {prepare: true});

            // Then tables
            console.log('User Table Creation');
            await db.execute(user_table_creation.query, user_table_creation.params, { prepare: true });

            console.log('Image Table Creation');
            await db.execute(image_table_creation.query, image_table_creation.params, { prepare: true });

            console.log('Web3Token Table Creation');
            await db.execute(web3token_table_creation.query, web3token_table_creation.params, { prepare: true });

            console.log('ActionSet Table Creation');
            await db.execute(actionset_table_creation.query, actionset_table_creation.params, { prepare: true });

            console.log('Date Table Creation');
            await db.execute(date_table_creation.query, date_table_creation.params, { prepare: true });

            console.log('Event Table Creation');
            await db.execute(event_table_creation.query, event_table_creation.params, { prepare: true });

            console.log('Tx Table Creation');
            await db.execute(tx_table_creation.query, tx_table_creation.params, { prepare: true });

            console.log('Global Table Creation');
            await db.execute(global_table_creation.query, global_table_creation.params, { prepare: true });

            console.log('Global Table Initial Document');
            await db.execute(global_table_initial_document.query, global_table_initial_document.params, { prepare: true });

            console.log('EVM Event Set Table Creation');
            await db.execute(evm_eventset_table_creation.query, evm_eventset_table_creation.params, { prepare: true });

            console.log('EVM Block Rollback Table Creation');
            await db.execute(evm_block_rollback_table_creation.query, evm_block_rollback_table_creation.params, { prepare: true });

            console.log('Gem Order Table Creation');
            await db.execute(gem_order_table_creation.query, gem_order_table_creation.params, { prepare: true });

            console.log('Stripe Resource Table Creation');
            await db.execute(stripe_resource_table_creation.query, stripe_resource_table_creation.params, { prepare: true });

        } catch (e) {
            return handler(e, false);
        }
        handler(false, true);
    },

    down : async function (db, handler) {

        const user_table_creation = {
            query: 'DROP TABLE ticket721.user;',
            params: []
        };

        const web3token_table_creation = {
            query: 'DROP TABLE ticket721.web3token;',
            params: []
        };

        const image_table_creation = {
            query: 'DROP TABLE ticket721.image;',
            params: []
        };

        const action_type_creation = {
            query: 'DROP TYPE ticket721.action;',
            params: []
        };

        const actionset_table_creation = {
            query: 'DROP TABLE ticket721.actionset;',
            params: []
        };

        const geo_point_type_creation = {
            query: 'DROP TYPE ticket721.geo_point;',
            params: []
        };

        const price_type_creation = {
            query: 'DROP TYPE ticket721.price;',
            params: []
        };

        const category_type_creation = {
            query: 'DROP TYPE ticket721.category;',
            params: []
        };

        const date_metadata_type_creation = {
            query: 'DROP TYPE ticket721.date_metadata;',
            params: []
        };

        const date_table_creation = {
            query: 'DROP TABLE ticket721.date;',
            params: []
        };

        const event_table_creation = {
            query: 'DROP TABLE ticket721.event;',
            params: []
        };

        const tx_log_type_creation = {
            query: `DROP TYPE ticket721.tx_log`,
            params: []
        };

        const tx_table_creation = {
            query: `DROP TABLE ticket721.tx`,
            params: []
        };

        const global_table_creation = {
            query: `DROP TABLE ticket721.global`,
            params: []
        };

        const evm_event_type_creation = {
            query: `DROP TYPE ticket721.evmevent`,
            params: []
        };

        const evm_eventset_table_creation = {
            query: `DROP TABLE ticket721.evmeventset`,
            params: []
        };

        const dry_response_type_creation = {
            query: `DROP TYPE ticket721.dryresponse`,
            params: []
        };

        const evm_block_rollback_table_creation = {
            query: `DROP TABLE ticket721.evmblockrollback`,
            params: []
        };

        const gem__operation_status_type_creation = {
            query: `DROP TYPE ticket721.gem__operation_status`,
            params: []
        };

        const gem__transfer_entity_status_type_creation = {
            query: `DROP TYPE ticket721.gem__transfer_entity_status`,
            params: []
        };

        const gem__transfer_status_type_creation = {
            query: `DROP TYPE ticket721.gem__transfer_status`,
            params: []
        };

        const gem__payload_cost_type_creation = {
            query: `DROP TYPE ticket721.gem__payload_cost`,
            params: []
        };

        const gem__payload_type_creation = {
            query: `DROP TYPE ticket721.gem__payload`,
            params: []
        };

        const gem__error_info_type_creation = {
            query: `DROP TYPE ticket721.gem__error_info`,
            params: []
        };

        const gem__route_history_type_creation = {
            query: `DROP TYPE ticket721.gem__route_history`,
            params: []
        };

        const gem_type_creation = {
            query: `DROP TYPE ticket721.gem`,
            params: []
        };

        const gem_order_table_creation = {
            query: `DROP TABLE ticket721.gemorder`,
            params: []
        };

        const stripe_resource_table_creation = {
            query: `DROP TABLE ticket721.striperesource`,
            params: []
        };

        try {

            // Tables first
            console.log('User Table Deletion');
            await db.execute(user_table_creation.query, user_table_creation.params, { prepare: true });

            console.log('Image Table Deletion');
            await db.execute(image_table_creation.query, image_table_creation.params, { prepare: true });

            console.log('Web3Token Table Deletion');
            await db.execute(web3token_table_creation.query, web3token_table_creation.params, { prepare: true });

            console.log('ActionSet Table Deletion');
            await db.execute(actionset_table_creation.query, actionset_table_creation.params, { prepare: true });

            console.log('Date Table Deletion');
            await db.execute(date_table_creation.query, date_table_creation.params, { prepare: true });

            console.log('Event Table Deletion');
            await db.execute(event_table_creation.query, event_table_creation.params, { prepare: true });

            console.log('Tx Table Deletion');
            await db.execute(tx_table_creation.query, tx_table_creation.params, { prepare: true });

            console.log('Global Table Deletion');
            await db.execute(global_table_creation.query, global_table_creation.params, { prepare: true });

            console.log('EVM Event Set Table Deletion');
            await db.execute(evm_eventset_table_creation.query, evm_eventset_table_creation.params, { prepare: true });

            console.log('EVM Block Rollback Table Deletion');
            await db.execute(evm_block_rollback_table_creation.query, evm_block_rollback_table_creation.params, { prepare: true });

            console.log('Gem Order Table Creation');
            await db.execute(gem_order_table_creation.query, gem_order_table_creation.params, { prepare: true });

            console.log('Stripe Resource Table Creation');
            await db.execute(stripe_resource_table_creation.query, stripe_resource_table_creation.params, { prepare: true });

            // Then Types
            console.log('Action Type Deletion');
            await db.execute(action_type_creation.query, action_type_creation.params, { prepare: true });

            console.log('GeoPoint Type Deletion');
            await db.execute(geo_point_type_creation.query, geo_point_type_creation.params, { prepare: true });

            console.log('Category Type Deletion');
            await db.execute(category_type_creation.query, category_type_creation.params, { prepare: true });

            console.log('Price Type Deletion');
            await db.execute(price_type_creation.query, price_type_creation.params, { prepare: true });

            console.log('Date Metadata Type Deletion');
            await db.execute(date_metadata_type_creation.query, date_metadata_type_creation.params, { prepare: true });

            console.log('Tx Log Type Deletion');
            await db.execute(tx_log_type_creation.query, tx_log_type_creation.params, { prepare: true });

            console.log('EVM Event Type Deletion');
            await db.execute(evm_event_type_creation.query, evm_event_type_creation.params, { prepare: true });

            console.log('Dry Response Type Deletion');
            await db.execute(dry_response_type_creation.query, dry_response_type_creation.params, { prepare: true });

            console.log('Gem Type Creation');
            await db.execute(gem_type_creation.query, gem_type_creation.params, {prepare: true});

            console.log('Gem Route History Type Creation');
            await db.execute(gem__route_history_type_creation.query, gem__route_history_type_creation.params, {prepare: true});

            console.log('Gem Error Info Type Creation');
            await db.execute(gem__error_info_type_creation.query, gem__error_info_type_creation.params, {prepare: true});

            console.log('Gem Payload Type Creation');
            await db.execute(gem__payload_type_creation.query, gem__payload_type_creation.params, {prepare: true});

            console.log('Gem Payload Cost Type Creation');
            await db.execute(gem__payload_cost_type_creation.query, gem__payload_cost_type_creation.params, {prepare: true});

            console.log('Gem Transfer Status Type Creation');
            await db.execute(gem__transfer_status_type_creation.query, gem__transfer_status_type_creation.params, {prepare: true});

            console.log('Gem Transfer Entity Status Type Creation');
            await db.execute(gem__transfer_entity_status_type_creation.query, gem__transfer_entity_status_type_creation.params, {prepare: true});

            console.log('Gem Operation Status Type Creation');
            await db.execute(gem__operation_status_type_creation.query, gem__operation_status_type_creation.params, {prepare: true});

        } catch (e) {
            return handler(e, false);
        }

        handler(false, true);
    }
};
module.exports = migration1576415205;
