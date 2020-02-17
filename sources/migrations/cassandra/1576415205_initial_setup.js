
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
                        eth_eur_price, 
                        created_at, 
                        updated_at
                    ) values (
                        'global',
                        0,
                        100000,
                        toTimeStamp(toDate(now())),
                        toTimeStamp(toDate(now()))
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


        } catch (e) {
            return handler(e, false);
        }

        handler(false, true);
    }
};
module.exports = migration1576415205;
