
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
                    updated_at timestamp
                    );`,
            params: []
        };

        try {

            // Types first
            console.log('Action Type Creation');
            await db.execute(action_type_creation.query, action_type_creation.params, { prepare: true });

            // Then tables
            console.log('User Table Creation');
            await db.execute(user_table_creation.query, user_table_creation.params, { prepare: true });

            console.log('Web3Token Table Creation');
            await db.execute(web3token_table_creation.query, web3token_table_creation.params, { prepare: true });

            console.log('ActionSet Table Creation');
            await db.execute(actionset_table_creation.query, actionset_table_creation.params, { prepare: true });

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

        const action_type_creation = {
            query: 'DROP TYPE ticket721.action;',
            params: []
        };

        const actionset_table_creation = {
            query: 'DROP TABLE ticket721.actionset;',
            params: []
        };

        try {

            // Tables first
            console.log('User Table Deletion');
            await db.execute(user_table_creation.query, user_table_creation.params, { prepare: true });

            console.log('Web3Token Table Deletion');
            await db.execute(web3token_table_creation.query, web3token_table_creation.params, { prepare: true });

            console.log('ActionSet Table Deletion');
            await db.execute(actionset_table_creation.query, actionset_table_creation.params, { prepare: true });

            // Then Types
            console.log('Action Type Deletion');
            await db.execute(action_type_creation.query, action_type_creation.params, { prepare: true });
        } catch (e) {
            return handler(e, false);
        }

        handler(false, true);
    }
};
module.exports = migration1576415205;
