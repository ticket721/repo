
var migration1595938079 = {
    up : async function (db, handler) {
        const stripe_payment_method_type_creation = {
            query: `CREATE TYPE IF NOT EXISTS ticket721.stripe_payment_method (
                        type text,
                        stripe_token text
                    );`,
            params: []
        };

        const stripe_interface_table_creation = {
            query: `CREATE TABLE IF NOT EXISTS ticket721.stripe_interface (
                    id UUID PRIMARY KEY,
                    owner UUID,
                    payment_methods list<frozen<ticket721.stripe_payment_method>>,
                    connect_account text,
                    connect_account_status text,
                    connect_account_business_type text,
                    connect_account_updated_at timestamp,
                    created_at timestamp,
                    updated_at timestamp
                    );`,
            params: []
        };

        try {

            console.log('Stripe Payment Method Type Creation');
            await db.execute(stripe_payment_method_type_creation.query, stripe_payment_method_type_creation.params, { prepare: true });

            console.log('Stripe Interface Table Creation');
            await db.execute(stripe_interface_table_creation.query, stripe_interface_table_creation.params, { prepare: true });

        } catch (e) {
            return handler(e, false);
        }
        handler(false, true);
    },
    down : async function (db, handler) {

        const stripe_payment_method_type_creation = {
            query: `DROP TYPE ticket721.stripe_payment_method;`,
            params: []
        };

        const stripe_interface_table_creation = {
            query: `DROP TABLE ticket721.stripe_interface;`,
            params: []
        };

        try {

            console.log('Stripe Interface Table Creation');
            await db.execute(stripe_interface_table_creation.query, stripe_interface_table_creation.params, { prepare: true });

            console.log('Stripe Payment Method Type Creation');
            await db.execute(stripe_payment_method_type_creation.query, stripe_payment_method_type_creation.params, { prepare: true });

        } catch (e) {
            return handler(e, false);
        }

        handler(false, true);
    }
};
module.exports = migration1595938079;
