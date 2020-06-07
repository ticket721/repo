
var migration1591548331 = {
    up : async function (db, handler) {

        const user_stripe_customer_token_creation = {
            query: `ALTER TABLE ticket721.user 
            ADD stripe_customer_token text;`,
            params: []
        };

        try {

            console.log('Stripe Customer Token Field creation');
            await db.execute(user_stripe_customer_token_creation.query, user_stripe_customer_token_creation.params, { prepare: true });

        } catch (e) {
            return handler(e, false);
        }
        handler(false, true);
    },

    down : async function (db, handler) {

        const user_stripe_customer_token_creation = {
            query: `ALTER TABLE ticket721.user 
            DROP stripe_customer_token;`,
            params: []
        };

        try {

            console.log('Stripe Customer Token Field Deletion');
            await db.execute(user_stripe_customer_token_creation.query, user_stripe_customer_token_creation.params, { prepare: true });

        } catch (e) {
            return handler(e, false);
        }

        handler(false, true);
    }
};

module.exports = migration1591548331;
