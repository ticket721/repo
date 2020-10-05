
var migration1601551889 = {
    up : async function (db, handler) {

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

        const user_payments_cart_field_creation = {
            query: `ALTER TABLE ticket721.user
             ADD (
                current_purchase frozen<ticket721.purchase>,
                past_purchases list<frozen<ticket721.purchase>>
             );`,
            params: []
        };

        const event_owner_field_deletion = {
            query: `ALTER TABLE ticket721.event
             DROP (
                categories
             );`,
            params: []
        };

        const event_owner_field_creation = {
            query: `ALTER TABLE ticket721.event
             ADD (
                owner uuid,
                avatar text,
                description text
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

            console.log('Event owner field deletion');
            await db.execute(event_owner_field_deletion.query, event_owner_field_deletion.params, { prepare: true });

            console.log('Event owner field creation');
            await db.execute(event_owner_field_creation.query, event_owner_field_creation.params, { prepare: true });

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

        const user_payments_cart_field_creation = {
            query: `ALTER TABLE ticket721.user
             DROP (
                current_purchase,
                past_purchases
             );`,
            params: []
        };

        const event_owner_field_deletion = {
            query: `ALTER TABLE ticket721.event
             ADD (
                categories list<uuid>
             );`,
            params: []
        };

        const event_owner_field_creation = {
            query: `ALTER TABLE ticket721.event
              DROP (
                owner,
                avatar,
                description
             );`,
            params: []
        };

        try {

            console.log('Event owner field creation');
            await db.execute(event_owner_field_creation.query, event_owner_field_creation.params, { prepare: true });

            console.log('Event owner field deletion');
            await db.execute(event_owner_field_deletion.query, event_owner_field_deletion.params, { prepare: true });

            console.log('User cart & transaction field creation');
            await db.execute(user_payments_cart_field_creation.query, user_payments_cart_field_creation.params, { prepare: true });

            console.log('Purchase Type Creation');
            await db.execute(purchase_type_creation.query, purchase_type_creation.params, { prepare: true });

            console.log('Payment Type Creation');
            await db.execute(payment_type_creation.query, payment_type_creation.params, { prepare: true });

            console.log('Product Type Creation');
            await db.execute(product_type_creation.query, product_type_creation.params, { prepare: true });

        } catch (e) {
            handler(e, false);
        }

        handler(false, true);
    }
};
module.exports = migration1601551889;
