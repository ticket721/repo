# server

## Description

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Unitary Tests

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

## E2E Tests

```bash
# unit tests
$ npm run test:e2e

# test coverage
$ npm run test:e2e:cov
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

Configuration of the API happens in the appropriate environment file inside the `env` directory.

| Name | Description | Default | Required |
| :---: | :---: | :---: | :---: |
| `API_PORT` | Port used to expose the api | 3000 | true |
| `CASSANDRA_CONTACT_POINTS` | List of hostnames / IPs of cassandra nodes of the cluster, delimited by `+`. ex: `127.0.0.1+192.168.0.1` for 2 contact points | `undefined` | true |
| `CASSANDRA_PORT` | Port on which the client connects to cassandra | `undefined` | true |
| `ELASTICSEARCH_HOST` | Hostname / IP of ElasticSearch endpoint | `undefined` | true |
| `ELASTICSEARCH_PORT` | Port of ElasticSearch endpoint | `undefined` | true |
| `ELASTICSEARCH_PROTOCOL` | Protocol of ElasticSearch endpoint | `http` | false |


