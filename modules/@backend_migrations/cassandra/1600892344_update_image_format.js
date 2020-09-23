
var migration1600892344 = {
    up : async function (db, handler) {
        let dateResultSet = (await db.execute('SELECT id, metadata FROM ticket721.date;', [], { prepare: true }));
        do {

            if (dateResultSet.rows.length) {

                for (const date of dateResultSet.rows) {

                    console.log(`Updating date ${date.id}`);
                    await db.execute(`UPDATE ticket721.date SET metadata={
                                                                    name: '${date.metadata.name}',
                                                                    description: '${date.metadata.description}',
                                                                    tags: [${date.metadata.tags.map(t => `'${t}'`).join(',')}],
                                                                    avatar: 'https://ticket721.s3.eu-west-3.amazonaws.com/public/placeholder',
                                                                    signature_colors: [${date.metadata.signature_colors.map(sc => `'${sc}'`).join(',')}]
                                          } WHERE id=${date.id};`, [], { prepare: true })
                }

            }

        } while (dateResultSet.nextPage && await dateResultSet.nextPage())

        handler(false, true);

    },
    down : async function (db, handler) {

    }
};
module.exports = migration1600892344;
