# sources

Contains all the code of the T721 platform: server, webapp, mobile apps ...

| Section | Path | Description |
| :---: | :---: | :---: |
| [`server`](./server/README.md) | `sources/server` | The T721 API Server |
| [`migrations`](./migrations/README.md) | `sources/migrations` | Migration scripts for Cassandra & ElasticSearch |
| [`sdk`](./sdk/README.md) | `sources/sdk` | Client for the T721 API Server |
| [`global`](./global/README.md) | `sources/global` | Global Utilities used across all sub-projects |
| [`simulation`](./simulation/README.md) | `sources/simulation` | Script to populate the server with events |

## Development Setups

### Server

You need 4 terminals in order to have the perfect server development setup. We'll call them `T1` to `T4`;

### 1. Running Elassandra Docker Container in `T1`

Run this command
```bash
./sources/scripts/run_dev_infra.sh
```
And keep the terminal open

As soon as you see `Elassandra started` in the terminal, you can proceed with the migration

### 2. Running the migration script

Run this command
```bash
cd migrations && env CASSANDRA_HOSTS=127.0.0.1 CASSANDRA_PORT=32702 ELASTICSEARCH_HOST=127.0.0.1:32610 ./migrate.sh
```

### 3. Running @ticket721source/global watch and build in `T2`

Run this command
```bash
cd global && npm run watch
```
And keep the terminal open

### 4. Running @ticket721source/sdk watch and build in `T3`

Run this command
```bash
cd sdk && npm run watch
```
And keep the terminal open

### 5. Running @ticket721source/server watch and build in `T3`

Run this command
```bash
cd server && env NODE_ENV=development API_PORT=3000 npm run start:dev
```
And keep the terminal open

