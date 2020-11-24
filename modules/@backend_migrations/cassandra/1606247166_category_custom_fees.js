
var migration1606247166 = {
    up : async function (db, handler) {

        const category_custom_fees_creation = {
            query: `ALTER TABLE ticket721.category
             ADD (
                  custom_static_fee int,
                  custom_percent_fee double
             );`,
            params: []
        };

        try {

            console.log('Category Custom Fees fields creation');
            await db.execute(category_custom_fees_creation.query, category_custom_fees_creation.params, { prepare: true });

        } catch (e) {
            return handler(e, false);
        }

        handler(false, true);

    },
    down : async function (db, handler) {

        const category_custom_fees_creation = {
            query: `ALTER TABLE ticket721.category
             DROP (
                  custom_static_fee,
                  custom_percent_fee
             );`,
            params: []
        };

        try {

            console.log('Category Custom Fees fields creation');
            await db.execute(category_custom_fees_creation.query, category_custom_fees_creation.params, { prepare: true });

        } catch (e) {
            return handler(e, false);
        }

        handler(false, true);

    }
};
module.exports = migration1606247166;
