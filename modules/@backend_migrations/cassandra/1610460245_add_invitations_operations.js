
var migration1610460245 = {
    up : async function (db, handler) {
        const operation_table_update = {
            query: `ALTER TABLE ticket721.operation ADD ( 
                        client_email text,
                        currency text
                    );`,
            params: []
        };

        try {
            console.log('Operation Table Update');
            await db.execute(operation_table_update.query, operation_table_update.params, { prepare: true });
        } catch (e) {
            handler(e, false);
        }

        handler(false, true);
    },
    down : async function (db, handler) {
        const operation_table_update = {
            query: `ALTER TABLE ticket721.operation DROP (
                client_email,
                currency
            );`,
            params: []
        };

        try {
            console.log('Operation Table Update');
            await db.execute(operation_table_update.query, operation_table_update.params, { prepare: true });
        } catch (e) {
            handler(e, false);
        }

        handler(false, true);
    }
};
module.exports = migration1610460245;
