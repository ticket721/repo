
var migration1604571522 = {
    up : async function (db, handler) {

        const venmas_point_type_creation = {
            query: `CREATE TYPE IF NOT EXISTS ticket721.venmas_section_point (
                    x float,
                    y float
                );`,
            params: []
        };

        const venmas_section_type_creation = {
            query: `CREATE TYPE IF NOT EXISTS ticket721.venmas_section (
                    id UUID,
                    type text,
                    name text,
                    description text,
                    points list<frozen<ticket721.venmas_section_point>>
                );`,
            params: []
        };

        const venmas_map_table_creation = {
            query: `CREATE TABLE IF NOT EXISTS ticket721.venmas_map (
                    id UUID PRIMARY KEY,
                    name text,
                    owner UUID,
                    map text,
                    sections list<frozen<ticket721.venmas_section>>,
                    created_at timestamp,
                    updated_at timestamp,
                );`,
            params: []
        };

        try {

            console.log('Venmas Point Type Creation');
            await db.execute(venmas_point_type_creation.query, venmas_point_type_creation.params, { prepare: true });

            console.log('Venmas Section Type Creation');
            await db.execute(venmas_section_type_creation.query, venmas_section_type_creation.params, { prepare: true });

            console.log('Venmas Map Table Creation');
            await db.execute(venmas_map_table_creation.query, venmas_map_table_creation.params, { prepare: true });

        } catch (e) {
            return handler(e, false);
        }
        handler(false, true);
  },
  down : async function (db, handler) {

      const venmas_point_type_creation = {
          query: `DROP TYPE ticket721.venmas_section_point;`,
          params: []
      };

      const venmas_section_type_creation = {
          query: `DROP TYPE ticket721.venmas_section;`,
          params: []
      };

      const venmas_map_table_creation = {
          query: `DROP TABLE ticket721.venmas_map`,
          params: []
      };

      try {

          console.log('Venmas Map Table Creation');
          await db.execute(venmas_map_table_creation.query, venmas_map_table_creation.params, { prepare: true });

          console.log('Venmas Section Type Creation');
          await db.execute(venmas_section_type_creation.query, venmas_section_type_creation.params, { prepare: true });

          console.log('Venmas Point Type Creation');
          await db.execute(venmas_point_type_creation.query, venmas_point_type_creation.params, { prepare: true });

      } catch (e) {
          return handler(e, false);
      }

      handler(false, true);
  }
};
module.exports = migration1604571522;
