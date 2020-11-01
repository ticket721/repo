
var migration1601551889 = {
    up : async function (db, handler) {

        //
        //
        //

        const product_type_creation = {
            query: `CREATE TYPE IF NOT EXISTS ticket721.product (
            type text,
            id text,
            quantity int,
            group_id text
          );`,
            params: []
        };

        const payment_type_creation = {
            query: `CREATE TYPE IF NOT EXISTS ticket721.payment (
                type text,
                id text,
                client_id text,
                status text
          );`,
            params: []
        };

        const fee_type_creation = {
            query: `CREATE TYPE IF NOT EXISTS ticket721.fee (
                type text,
                price int
          );`,
            params: []
        }

        const purchase_table_creation = {
            query: `CREATE TABLE IF NOT EXISTS ticket721.purchase (
                id UUID PRIMARY KEY,
                owner uuid,
                products list<frozen<ticket721.product>>,
                payment frozen<ticket721.payment>,
                fees list<frozen<ticket721.fee>>,
                created_at timestamp,
                updated_at timestamp,
                closed_at timestamp,
                checked_out_at timestamp,
                payment_interface text,
                price int,
                currency text
            );`,
            params: []
        }

        //
        //
        //

        const user_payments_cart_field_creation = {
            query: `ALTER TABLE ticket721.user
             ADD (
                current_purchase uuid,
                past_purchases list<uuid>
             );`,
            params: []
        };

        //
        //
        //

        const event_drop_table = {
            query: `DROP TABLE ticket721.event;`,
            params: []
        };

        const event_create_table = {
            query: `CREATE TABLE IF NOT EXISTS ticket721.event (
                        id UUID PRIMARY KEY,
                        group_id text,
                        name text,
                        owner uuid,
                        avatar text,
                        description text,
                        address text,
                        signature_colors list<text>,
                        status text,
                        controller text,
                        dates list<uuid>,
                        stripe_interface uuid,
                        custom_static_fee int,
                        custom_percent_fee double,
                        created_at timestamp,
                        updated_at timestamp
                    );`,
            params: []
        };

        //
        //
        //

        const date_drop_table = {
            query: `
                DROP TABLE ticket721.date;
             `,
            params: []
        }

        const date_metadata_drop = {
            query: `
                DROP TYPE ticket721.date_metadata;
             `,
            params: []
        }

        const date_metadata_recreation = {
            query: `CREATE TYPE IF NOT EXISTS ticket721.date_metadata (
                        name text,
                        description text,
                        avatar text,
                        signature_colors list<text>,
                        twitter text,
                        email text,
                        linked_in text,
                        tiktok text,
                        instagram text,
                        website text,
                        facebook text,
                        spotify text
                    );`,
            params: []
        };

        const date_table_recreation = {
            query: `CREATE TABLE IF NOT EXISTS ticket721.date (
                        id UUID PRIMARY KEY,
                        event uuid,
                        group_id text,
                        categories list<uuid>,
                        location frozen<ticket721.date_location>,
                        timestamps frozen<ticket721.date_timestamps>,
                        metadata frozen<ticket721.date_metadata>,
                        online boolean,
                        online_link text,
                        status text,
                        created_at timestamp,
                        updated_at timestamp
                    );`,
            params: []
        };

        //
        //
        //

        const category_drop_table = {
            query: `
                DROP TABLE ticket721.category;
             `,
            params: []
        }

        const category_table_recreation = {
            query: `CREATE TABLE IF NOT EXISTS ticket721.category (
                        id UUID PRIMARY KEY,
                        group_id text,
                        category_name text,
                        display_name text,
                        sale_begin timestamp,
                        sale_end timestamp,
                        price int,
                        status text,
                        currency text,
                        interface text,
                        dates list<uuid>,
                        seats int,
                        created_at timestamp,
                        updated_at timestamp
                    );`,
            params: []
        };

        //
        //
        //

        const ticket_drop_table = {
            query: `
                DROP TABLE ticket721.ticket;
             `,
            params: []
        }

        const ticket_table_recreation = {
            query: `CREATE TABLE IF NOT EXISTS ticket721.ticket ( 
                        id uuid PRIMARY KEY,
                        receipt uuid,
                        owner text,
                        category uuid,
                        group_id text,
                        created_at timestamp,
                        updated_at timestamp
                    );`,
            params: []
        };

        //
        //
        //

        const operation_create_table = {
            query: `CREATE TABLE IF NOT EXISTS ticket721.operation (
                        id TIMEUUID PRIMARY KEY,
                        group_id text,
                        purchase_id uuid,
                        client_id uuid,
                        category_id uuid,
                        ticket_ids list<uuid>,
                        type text,
                        status text,
                        quantity int,
                        fee int,
                        price int,
                        created_at timestamp,
                        updated_at timestamp
                    );`,
            params: []
        };

        //
        //
        //

        try {
            console.log('Product Type Creation');
            await db.execute(product_type_creation.query, product_type_creation.params, { prepare: true });

            console.log('Payment Type Creation');
            await db.execute(payment_type_creation.query, payment_type_creation.params, { prepare: true });

            console.log('Fee Type Creation');
            await db.execute(fee_type_creation.query, fee_type_creation.params, { prepare: true });

            console.log('Purchase Type Creation');
            await db.execute(purchase_table_creation.query, purchase_table_creation.params, { prepare: true });



            console.log('User cart & transaction field creation');
            await db.execute(user_payments_cart_field_creation.query, user_payments_cart_field_creation.params, { prepare: true });



            console.log('Event drop table');
            await db.execute(event_drop_table.query, event_drop_table.params, { prepare: true });

            console.log('Event create table');
            await db.execute(event_create_table.query, event_create_table.params, { prepare: true });




            console.log('Date drop table');
            await db.execute(date_drop_table.query, date_drop_table.params, { prepare: true });

            console.log('Date metadata drop');
            await db.execute(date_metadata_drop.query, date_metadata_drop.params, { prepare: true });

            console.log('Date metadata recreation');
            await db.execute(date_metadata_recreation.query, date_metadata_recreation.params, { prepare: true });

            console.log('Date recreate table');
            await db.execute(date_table_recreation.query, date_table_recreation.params, { prepare: true });




            console.log('Category drop table');
            await db.execute(category_drop_table.query, category_drop_table.params, { prepare: true });

            console.log('Category recreate table');
            await db.execute(category_table_recreation.query, category_table_recreation.params, { prepare: true });




            console.log('Ticket drop table');
            await db.execute(ticket_drop_table.query, ticket_drop_table.params, { prepare: true });

            console.log('Ticket recreate table');
            await db.execute(ticket_table_recreation.query, ticket_table_recreation.params, { prepare: true });




            console.log('Operation create table');
            await db.execute(operation_create_table.query, operation_create_table.params, { prepare: true });
        } catch (e) {
            handler(e, false);
        }

        handler(false, true);

    },
    down : async function (db, handler) {

        const product_type_creation = {
            query: `DROP TYPE ticket721.product;`,
            params: []
        };

        const payment_type_creation = {
            query: `DROP TYPE ticket721.payment;`,
            params: []
        };

        const fee_type_creation = {
            query: `DROP TYPE ticket721.fee;`,
            params: []
        }

        const purchase_table_creation = {
            query: `DROP TABLE ticket721.purchase;`,
            params: []
        }

        //
        //
        //

        const user_payments_cart_field_creation = {
            query: `ALTER TABLE ticket721.user
             DROP (
                current_purchase,
                past_purchases
             );`,
            params: []
        };

        //
        //
        //

        const event_drop_table = {
            query: `DROP TABLE ticket721.event;`,
            params: []
        };

        const event_create_table = {
            query: `CREATE TABLE IF NOT EXISTS ticket721.event (
                        id UUID PRIMARY KEY,
                        group_id text,
                        name text,
                        address text,
                        controller text,
                        dates list<uuid>,
                        categories list<uuid>,
                        created_at timestamp,
                        updated_at timestamp
                    );`,
            params: []
        };

        //
        //
        //

        const date_drop_table = {
            query: `
                DROP TABLE ticket721.date;
             `,
            params: []
        }

        const date_metadata_drop = {
            query: `
                DROP TYPE ticket721.date_metadata;
             `,
            params: []
        }

        const date_metadata_recreation = {
            query: `CREATE TYPE IF NOT EXISTS ticket721.date_metadata (
                        name text,
                        description text,
                        tags list<text>,
                        avatar text,
                        signature_colors list<text>
                    );`,
            params: []
        };

        const date_table_recreation = {
            query: `CREATE TABLE IF NOT EXISTS ticket721.date (
                        id UUID PRIMARY KEY,
                        group_id text,
                        categories list<uuid>,
                        location frozen<ticket721.date_location>,
                        timestamps frozen<ticket721.date_timestamps>,
                        metadata frozen<ticket721.date_metadata>,
                        parent_id uuid,
                        parent_type text,
                        status text,
                        created_at timestamp,
                        updated_at timestamp
                    );`,
            params: []
        };

        //
        //
        //

        const category_drop_table = {
            query: `
                DROP TABLE ticket721.category;
             `,
            params: []
        }

        const category_table_recreation = {
            query: `CREATE TABLE IF NOT EXISTS ticket721.category (
                        id UUID PRIMARY KEY,
                        group_id text,
                        category_name text,
                        display_name text,
                        sale_begin timestamp,
                        sale_end timestamp,
                        resale_begin timestamp,
                        resale_end timestamp,
                        scope text,
                        prices list<frozen<ticket721.price>>,
                        seats int,
                        reserved int,
                        parent_id uuid,
                        parent_type text,
                        created_at timestamp,
                        updated_at timestamp
                    );`,
            params: []
        };

        //
        //
        //

        const ticket_drop_table = {
            query: `
                DROP TABLE ticket721.ticket;
             `,
            params: []
        }

        const ticket_table_recreation = {
            query: `CREATE TABLE IF NOT EXISTS ticket721.ticket ( 
                        id text PRIMARY KEY,
                        authorization uuid,
                        owner text,
                        env text,
                        status text,
                        transaction_hash text,
                        category uuid,
                        group_id text,
                        parent_id uuid,
                        parent_type text,
                        created_at timestamp,
                        updated_at timestamp
                    );`,
            params: []
        };

        //
        //
        //

        const operation_create_table = {
            query: `DROP TABLE ticket721.operation;`,
            params: []
        };

        //
        //
        //


        try {
            console.log('Operation create table');
            await db.execute(operation_create_table.query, operation_create_table.params, { prepare: true });




            console.log('Ticket drop table');
            await db.execute(ticket_drop_table.query, ticket_drop_table.params, { prepare: true });

            console.log('Ticket recreate table');
            await db.execute(ticket_table_recreation.query, ticket_table_recreation.params, { prepare: true });



            console.log('Category drop table');
            await db.execute(category_drop_table.query, category_drop_table.params, { prepare: true });

            console.log('Category recreate table');
            await db.execute(category_table_recreation.query, category_table_recreation.params, { prepare: true });




            console.log('Date drop table');
            await db.execute(date_drop_table.query, date_drop_table.params, { prepare: true });

            console.log('Date metadata drop');
            await db.execute(date_metadata_drop.query, date_metadata_drop.params, { prepare: true });

            console.log('Date metadata recreation');
            await db.execute(date_metadata_recreation.query, date_metadata_recreation.params, { prepare: true });

            console.log('Date recreate table');
            await db.execute(date_table_recreation.query, date_table_recreation.params, { prepare: true });



            console.log('Event drop table');
            await db.execute(event_drop_table.query, event_drop_table.params, { prepare: true });

            console.log('Event create table');
            await db.execute(event_create_table.query, event_create_table.params, { prepare: true });




            console.log('User cart & transaction field creation');
            await db.execute(user_payments_cart_field_creation.query, user_payments_cart_field_creation.params, { prepare: true });




            console.log('Product Type Creation');
            await db.execute(product_type_creation.query, product_type_creation.params, { prepare: true });

            console.log('Payment Type Creation');
            await db.execute(payment_type_creation.query, payment_type_creation.params, { prepare: true });

            console.log('Fee Type Creation');
            await db.execute(fee_type_creation.query, fee_type_creation.params, { prepare: true });

            console.log('Purchase Table Creation');
            await db.execute(purchase_table_creation.query, purchase_table_creation.params, { prepare: true });

        } catch (e) {
            handler(e, false);
        }

        handler(false, true);
    }
};
module.exports = migration1601551889;
