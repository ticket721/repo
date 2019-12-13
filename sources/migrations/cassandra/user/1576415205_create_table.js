
var migration1576415205 = {
    up : function (db, handler) {
        var query = `CREATE TABLE ticket721.user ( 
        id UUID PRIMARY KEY, 
        email text,
        username text,
        password text,
        type text,
        wallet text,
        address text
        );`;
        var params = [];
        db.execute(query, params, { prepare: true }, function (err) {
            if (err) {
                handler(err, false);
            } else {
                handler(false, true);
            }
        });
    },
    down : function (db, handler) {
        var query = 'DROP TABLE ticket721.user;';
        var params = [];
        db.execute(query, params, { prepare: true }, function (err) {
            if (err) {
                handler(err, false);
            } else {
                handler(false, true);
            }
        });
    }
};
module.exports = migration1576415205;
