module.exports = {
    contactPoints: [...process.env.CASSANDRA_HOSTS.split('+')],
    keyspace: process.env.CASSANDRA_KEYSPACE,
    protocolOptions:{
        port: process.env.CASSANDRA_PORT
    }
}
