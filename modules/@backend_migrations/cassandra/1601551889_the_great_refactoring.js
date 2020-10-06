
var migration1601551889 = {
    up : async function (db, handler) {

        //
        //
        //

        const product_type_creation = {
            query: `CREATE TYPE IF NOT EXISTS ticket721.product (
            type text,
            id text,
            quantity int
          );`,
            params: []
        };

        const payment_type_creation = {
            query: `CREATE TYPE IF NOT EXISTS ticket721.payment (
                type text,
                id text,
                status text
          );`,
            params: []
        };

        const purchase_type_creation = {
            query: `CREATE TYPE IF NOT EXISTS ticket721.purchase (
                products list<frozen<ticket721.product>>,
                payment frozen<ticket721.payment>,
                created_at timestamp,
                closed_at timestamp,
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
                current_purchase frozen<ticket721.purchase>,
                past_purchases list<frozen<ticket721.purchase>>
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
                        controller text,
                        dates list<uuid>,
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
                        status text,
                        created_at timestamp,
                        updated_at timestamp
                    );`,
            params: []
        };

        try {
            console.log('Product Type Creation');
            await db.execute(product_type_creation.query, product_type_creation.params, { prepare: true });

            console.log('Payment Type Creation');
            await db.execute(payment_type_creation.query, payment_type_creation.params, { prepare: true });

            console.log('Purchase Type Creation');
            await db.execute(purchase_type_creation.query, purchase_type_creation.params, { prepare: true });



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

        const purchase_type_creation = {
            query: `DROP TYPE ticket721.purchase;`,
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

        try {

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

            console.log('Purchase Type Creation');
            await db.execute(purchase_type_creation.query, purchase_type_creation.params, { prepare: true });

        } catch (e) {
            handler(e, false);
        }

        handler(false, true);
    }
};
module.exports = migration1601551889;
