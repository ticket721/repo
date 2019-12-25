# server

## Description

## Installation

```bash
$ lerna bootstrap --scope='@ticket721sources/*'
```

## Testing

### Unitary Tests

```bash
# unit tests
npm run test

# test coverage
npm run test:cov
```

### E2E Tests

#### @apps/server

```bash
# unit tests
npm run test:server:e2e

# test coverage
npm run test:server:e2e:cov
```

## Documentation

### API

The documentation of the routes can be found on the `/api` route.

### Sources

Serve the source documentation localy by running:

```bash
npm run doc:serve
```

## Configuration

### @apps/server

Configuration of the API happens in the appropriate environment file inside the `env` directory.

| Name | Description | Default | Required |
| :---: | :---: | :---: | :---: |
| `API_PORT` | Port used to expose the api | 3000 | false |
| `CASSANDRA_CONTACT_POINTS` | List of hostnames / IPs of cassandra nodes of the cluster, delimited by `+`. ex: `127.0.0.1+192.168.0.1` for 2 contact points | `undefined` | true |
| `CASSANDRA_PORT` | Port on which the client connects to cassandra | `undefined` | true |
| `ELASTICSEARCH_HOST` | Hostname / IP of ElasticSearch endpoint | `undefined` | true |
| `ELASTICSEARCH_PORT` | Port of ElasticSearch endpoint | `undefined` | true |
| `ELASTICSEARCH_PROTOCOL` | Protocol of ElasticSearch endpoint | `http` | false |
| `ETHEREUM_NODE_HOST` | Hostname / IP of Ethereum node endpoint | `undefined` | true |
| `ETHEREUM_NODE_PORT` | Port of Ethereum node endpoint | `undefined` | true |
| `ETHEREUM_NODE_PROTOCOL` | Protocol of Ethereum node endpoint | `http` | false |
| `JWT_SECRET` | Secret key for the JWT token signatures | `undefined` | true |
| `JWT_EXPIRATION` | String for the token expiration | `24h` | false |
| `BULL_REDIS_HOST` | Hostname / IP of the Redis instance used by Bull | `undefined` | true |
| `BULL_REDIS_PORT` | Port of the Redis instance used by Bull | `undefined` | true |
| `BULL_BOARD` | `true` if the bull board should be exposed | `false` | false |
| `AUTH_SIGNATURE_TIMEOUT` | String for login signature expiration | `30000` | false |


