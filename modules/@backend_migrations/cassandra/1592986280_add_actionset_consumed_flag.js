
var migration1592986280 = {
    up : async function (db, handler) {
        const actionset_consumed_field_creation = {
            query: `ALTER TABLE ticket721.actionset
            ADD consumed boolean;`,
            params: []
        };

        try {

            console.log('ActionSet Consumed Field Creation');
            await db.execute(actionset_consumed_field_creation.query, actionset_consumed_field_creation.params, { prepare: true });

        } catch (e) {
            return handler(e, false);
        }
        handler(false, true);
    },
    down : async function (db, handler) {

        const actionset_consumed_field_creation = {
            query: `ALTER TABLE ticket721.actionset 
            DROP consumed;`,
            params: []
        };

        try {

            console.log('ActionSet Consumed Field Deletion');
            await db.execute(actionset_consumed_field_creation.query, actionset_consumed_field_creation.params, { prepare: true });

        } catch (e) {
            return handler(e, false);
        }

        handler(false, true);
    }
};
module.exports = migration1592986280;
