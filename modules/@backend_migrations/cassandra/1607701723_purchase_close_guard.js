
var migration1607701723 = {
    up : async function (db, handler) {

        const generated_product_type_creation = {
            query: `CREATE TYPE IF NOT EXISTS ticket721.generated_product (
            type text,
            id text,
            price int,
            currency text
          );`,
            params: []
        };

        const purchase_close_guard_creation = {
            query: `ALTER TABLE ticket721.purchase
             ADD (
                  close_guard timestamp,
                  final_price int,
                  generated_products list<frozen<ticket721.generated_product>>
             );`,
            params: []
        };

        try {

            console.log('Generated product type creation');
            await db.execute(generated_product_type_creation.query, generated_product_type_creation.params, { prepare: true });

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
                  final_price,
                  generated_products
             );`,
            params: []
        };

        const generated_product_type_creation = {
            query: `DROP TYPE ticket721.generated_product;`,
            params: []
        };

        try {

            console.log('Purchase Close Guard fields creation');
            await db.execute(purchase_close_guard_creation.query, purchase_close_guard_creation.params, { prepare: true });

            console.log('Generated product type creation');
            await db.execute(generated_product_type_creation.query, generated_product_type_creation.params, { prepare: true });


        } catch (e) {
            return handler(e, false);
        }

        handler(false, true);

    }
};
module.exports = migration1607701723;
