var migration1595338599 = {
    up : async function (db, handler) {
        const transaction_real_transaction_hash_field_creation = {
            query: `ALTER TABLE ticket721.tx
            ADD real_transaction_hash text;`,
            params: []
        };

        try {

            console.log('Tx Real Transaction Hash Field Creation');
            await db.execute(transaction_real_transaction_hash_field_creation.query, transaction_real_transaction_hash_field_creation.params, { prepare: true });

        } catch (e) {
            return handler(e, false);
        }
        handler(false, true);
    },
    down : async function (db, handler) {

        const transaction_real_transaction_hash_field_creation = {
            query: `ALTER TABLE ticket721.tx
            DROP real_transaction_hash;`,
            params: []
        };

        try {

            console.log('Tx Real Transaction Hash Field Deletion');
            await db.execute(transaction_real_transaction_hash_field_creation.query, transaction_real_transaction_hash_field_creation.params, { prepare: true });

        } catch (e) {
            return handler(e, false);
        }

        handler(false, true);
    }
};
module.exports = migration1595338599;
