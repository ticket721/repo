
var migration1607701723 = {
    up : async function (db, handler) {

        const purchase_close_guard_creation = {
            query: `ALTER TABLE ticket721.purchase
             ADD (
                  close_guard timestamp,
                  final_price int
             );`,
            params: []
        };

        try {

            console.log('Purchase Close Guard fields creation');
            await db.execute(purchase_close_guard_creation.query, purchase_close_guard_creation.params, { prepare: true });

        } catch (e) {
            return handler(e, false);
        }

        handler(false, true);

    },
    down : async function (db, handler) {

        const purchase_close_guard_creation = {
            query: `ALTER TABLE ticket721.purchase
             DROP (
                  close_guard,
                  final_price
             );`,
            params: []
        };

        try {

            console.log('Purchase Close Guard fields creation');
            await db.execute(purchase_close_guard_creation.query, purchase_close_guard_creation.params, { prepare: true });

        } catch (e) {
            return handler(e, false);
        }

        handler(false, true);

    }
};
module.exports = migration1607701723;
