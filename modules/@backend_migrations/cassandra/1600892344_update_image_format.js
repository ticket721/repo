
var migration1600892344 = {
    up : async function (db, handler) {

        const image_delete_table = {
            query: `DROP TABLE ticket721.image;`,
            params: []
        };

        try {

            let dateResultSet = (await db.execute('SELECT id, metadata FROM ticket721.date;', [], { prepare: true }));
            do {

                if (dateResultSet.rows.length) {

                    for (const date of dateResultSet.rows) {

                        console.log(`Updating date ${date.id}`);
                        await db.execute(`UPDATE ticket721.date SET metadata={
                                                                    name: '${date.metadata.name.replace("'", "''")}',
                                                                    description: '${date.metadata.description.replace("'", "''")}',
                                                                    tags: [${date.metadata.tags ? date.metadata.tags.map(t => `'${t.replace("'", "''")}'`).join(',') : ''}],
                                                                    avatar: 'https://ticket721.s3.eu-west-3.amazonaws.com/public/placeholder.png',
                                                                    signature_colors: [${date.metadata.signature_colors ? date.metadata.signature_colors.map(sc => `'${sc.replace("'", "''")}'`).join(',') : ''}]
                                          } WHERE id=${date.id};`, [], { prepare: true })
                    }

                }

            } while (dateResultSet.nextPage && await dateResultSet.nextPage())

            console.log('Image Table Deletion');
            await db.execute(image_delete_table.query, image_delete_table.params, { prepare: true });

        } catch (e) {
            handler(e, false);
        }

        handler(false, true);

    },
    down : async function (db, handler) {

        const image_table_creation = {
            query: `CREATE TABLE IF NOT EXISTS ticket721.image (
                    id UUID PRIMARY KEY,
                    mimetype text,
                    size int,
                    encoding text,
                    hash text,
                    links int,
                    created_at timestamp,
                    updated_at timestamp,
                    );`,
            params: []
        };

        try {

            console.log('Image Table Deletion');
            await db.execute(image_table_creation.query, image_table_creation.params, { prepare: true });

        } catch (e) {
            handler(e, false);
        }

        handler(false, true);
    }
};
module.exports = migration1600892344;
