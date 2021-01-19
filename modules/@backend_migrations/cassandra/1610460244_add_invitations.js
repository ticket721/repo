
var migration1610460244 = {
    up : async function (db, handler) {
        const invitation_table_recreation = {
            query: `CREATE TABLE IF NOT EXISTS ticket721.invitation ( 
                        id uuid PRIMARY KEY,
                        owner text,
                        dates list<uuid>,
                        group_id text,
                        created_at timestamp,
                        updated_at timestamp
                    );`,
            params: []
        };

        try {
            console.log('Product Type Creation');
            await db.execute(invitation_table_recreation.query, invitation_table_recreation.params, { prepare: true });
        } catch (e) {
            handler(e, false);
        }

        handler(false, true);
    },
    down : async function (db, handler) {
        const invitation_table_recreation = {
            query: `DROP TABLE ticket721.invitation;`,
            params: []
        };

        try {
            console.log('Product Type Creation');
            await db.execute(invitation_table_recreation.query, invitation_table_recreation.params, { prepare: true });
        } catch (e) {
            handler(e, false);
        }

        handler(false, true);
    }
};
module.exports = migration1610460244;
