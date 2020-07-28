const migration1594327541 = {
    up : async function (db, handler) {
        const user_device_address_field_creation = {
            query: `ALTER TABLE ticket721.user
            ADD device_address text;`,
            params: []
        };

        try {

            console.log('User Device Address Field Creation');
            await db.execute(user_device_address_field_creation.query, user_device_address_field_creation.params, { prepare: true });

        } catch (e) {
            return handler(e, false);
        }
        handler(false, true);
    },
    down : async function (db, handler) {

        const user_device_address_field_creation = {
            query: `ALTER TABLE ticket721.user
            DROP device_address;`,
            params: []
        };

        try {

            console.log('User Device Address Field Deletion');
            await db.execute(user_device_address_field_creation.query, user_device_address_field_creation.params, { prepare: true });

        } catch (e) {
            return handler(e, false);
        }

        handler(false, true);
    }
};
module.exports = migration1594327541;
