
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
                        scope text,
                        prices list<frozen<ticket721.price>>
                    );`,
            params: []
        };

        const date_metadata_type_creation = {
            query: `CREATE TYPE ticket721.date_metadata (
                        name text,
                        image text,
                    );`,
            params: []
        };

        const date_table_creation = {
            query: `CREATE TABLE ticket721.date (
                        id UUID PRIMARY KEY,
                        location_label text,
                        location frozen<ticket721.geo_point>,
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
                        dates list<uuid>,
                        name text,
                        description text,
                        avatar text,
                        banners list<text>,
                        categories list<frozen<ticket721.category>>,
                        created_at timestamp,
                        updated_at timestamp
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


        } catch (e) {
            return handler(e, false);
        }

        handler(false, true);
    }
};
module.exports = migration1576415205;
