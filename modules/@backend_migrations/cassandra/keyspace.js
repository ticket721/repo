const options = require('./options');
const {Client} = require('cassandra-driver');

if (options.keyspace) {
    options.keyspace = undefined;
}

const client = new Client(options);

const check_keyspaces = async () => {

    await client.connect();

    const res = await client.execute("SELECT * FROM system_schema.keyspaces");

    if (res.rows.findIndex(row => row.keyspace_name === 'ticket721') === -1) {

        console.log("Running => CREATE KEYSPACE IF NOT EXISTS ticket721 WITH REPLICATION = {'class': 'NetworkTopologyStrategy', 'DC1': 1}");
        const query = "CREATE KEYSPACE IF NOT EXISTS ticket721 WITH REPLICATION = {'class': 'NetworkTopologyStrategy', 'DC1': 1}";
        await client.execute(query);
        console.log("Created Keyspace ticket721");

    } else {

        console.log("Keyspace Setup: nothing to do");

    }

    await client.shutdown();

};

check_keyspaces();


