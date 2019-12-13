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

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
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

