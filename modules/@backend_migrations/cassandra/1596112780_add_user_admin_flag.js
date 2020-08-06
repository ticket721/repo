const Cassandra = require('cassandra-driver');

var migration1596112780 = {
    up : async function (db, handler) {
        const user_admin_field_creation = {
            query: `ALTER TABLE ticket721.user
            ADD admin boolean;`,
            params: []
        };

        try {

            console.log('User Admin Field Creation');
            await db.execute(user_admin_field_creation.query, user_admin_field_creation.params, { prepare: true });

            let userResultSet = (await db.execute('SELECT id FROM ticket721.user;', [], { prepare: true }));
            do {

                if (userResultSet.rows.length) {
                    console.log(`Updated ${userResultSet.rows.length} users`);
                    await db.execute(`UPDATE ticket721.user SET admin=false WHERE id IN (${userResultSet.rows.map((usr) => usr.id).join(', ')});`, [], { prepare: true })
                }

            } while (userResultSet.nextPage && await userResultSet.nextPage())

        } catch (e) {
            return handler(e, false);
        }
        handler(false, true);
    },
    down : async function (db, handler) {

        const user_admin_field_creation = {
            query: `ALTER TABLE ticket721.user
            DROP admin;`,
            params: []
        };

        try {

            console.log('User Admin Field Creation');
            await db.execute(user_admin_field_creation.query, user_admin_field_creation.params, { prepare: true });

        } catch (e) {
            return handler(e, false);
        }

        handler(false, true);
    }
};
module.exports = migration1596112780;
