
var migration1576924519 = {
    up : function (db, handler) {
        var query = `CREATE TABLE ticket721.web3token ( 
      timestamp bigint,
      address text,
      PRIMARY KEY((timestamp, address))
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
        var query = 'DROP TABLE ticket721.web3token;';
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
module.exports = migration1576924519;
