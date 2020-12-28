
var migration1608891951 = {
    up : async function (db, handler) {

        const add_user_avatar_field_creation = {
            query: `ALTER TABLE ticket721.user ADD (
                avatar text
          );`,
            params: []
        };

        try {

            console.log('Add user avatar field creation');
            await db.execute(add_user_avatar_field_creation.query, add_user_avatar_field_creation.params, { prepare: true });

        } catch (e) {
            return handler(e, false);
        }

        handler(false, true);

    },
    down : async function (db, handler) {

        const add_user_avatar_field_creation = {
            query: `ALTER TABLE ticket721.user DROP (
                avatar
          );`,
            params: []
        };

        try {

            console.log('Add user avatar field creation');
            await db.execute(add_user_avatar_field_creation.query, add_user_avatar_field_creation.params, { prepare: true });

        } catch (e) {
            return handler(e, false);
        }

        handler(false, true);

    }
};
module.exports = migration1608891951;
