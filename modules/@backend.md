# @backend

<p align="center">
  <img src="../.assets/@backend.png">
</p>

## Modules

| Name | Description | Git Submodule |
| :---: | :---: | :---: |
| [`@backend/email-templates`](./@backend_email-templates) | Contains all email templates sent to users | No |
| [`@backend/migrations`](./@backend_migrations) | Contains all cassandra and elasticsearch migrations | No |
| [`@backend/nest`](./@backend_nest) | Contains all NestJS code and apps | No |
| [`@backend/simulation`](./@backend_simulation) | Contains simulation scripts | No |

## Tutorials

### 1. Running infrastructure locally

The first step is to run the `docker-compose` configuration. After doing this, you can go on with steps `2` and `3`.
To run the infrastructure, go into `modules/@backend_nest/scripts` and run the following command

```
docker-compose -f ./infra.yaml down && docker-compose -f ./infra.yaml rm && ./run_dev_infra.sh
```

#### max_map_count error in elassandra ?

If you have an error mentioning that your max_map_count should be at least 262144, run the following command:
```
sudo sysctl -w vm.max_map_count=262144
```

### 2. Building dependencies

You will also need to be sure that the dependencies are properly built. What I advise you to do is to keep a terminal open with the following commands running in the background:

```
cd modules/@common_global && yarn watch
```

```
cd modules/@common_sdk && yarn watch
```

This will ensure that any modification to these two modules will be properly built.

### 3. Running the smart contracts migrations locally

In order to run the smart contracts migrations locally, you will need to use the gulp tasks defined in the @repo. Simply go at the root of the repository and run the following method to run all the required migrations.

```
rm -rf ./artifacts/remote_ganache/ && \
env T721_CONFIG=./config.ganache.remote.json gulp network::clean contracts::clean && \
env T721_CONFIG=./config.ganache.remote.json gulp network::run && \
env T721_CONFIG=./config.ganache.remote.json gulp contracts::run && \
env T721_CONFIG=./config.ganache.remote.json ARTIFACT_BUNDLE_TARGET_PATH=./modules/@frontend_core/src/subspace/contract_artifacts.json  gulp contracts::convert_artifacts
```

The smart contracts are now live, and all the required artifacts are now stored inside `artifacts/remote_ganache`.

### 4. Running the database migrations locally

To setup the database tables, run the following command

```
cd modules/@backend_migrations && env CASSANDRA_HOSTS=127.0.0.1 CASSANDRA_PORT=32702 ELASTICSEARCH_HOST=127.0.0.1:32610 ./migrate.sh
```

### 5. Starting the backend stack

To start the backend stack, you will need to do the steps `1`, `2`, `3` and `4`. Running these manually can be pretty time consumming. I advise you to create a terminal shortcut in order to directly run the proper commands and get the stack up and running quickly.

In the first terminal setup, this is what you should do:

```
______________________________________________________________________________________________
| $> docker-compose -f ./infra.yaml down && docker-compose -f ./infra.yaml rm && \           |
|    ./run_dev_infra.sh (step 1)                                                             |
|                                                                                            |
|                                                                                            |
|                                                                                            |
|                                                                                            |
|                                                                                            |
|                                                                                            |
|                                                                                            |
|                                                                                            |
|                                                                                            |
|                                                                                            |
|                                                                                            |
|____________________________________________________________________________________________|
| $> cd modules/@common_global && yarn watch   | $> cd modules/@common_sdk && yarn watch     |
|    (step 2)                                  |    (step 2)                                 |
|                                              |                                             |
|                                              |                                             |
|                                              |                                             |
|                                              |                                             |
|                                              |                                             |
|______________________________________________|_____________________________________________|
```

Keep these always open. You will have to wait for the docker-compose command to show you when `elassandra` is ready. The console will clearly state `Elassandra is ready`. Should take ~1 minute, perfect timing to get a coffee ! Once `elassandra` and your coffee are ready, we need to run the migrations.

In the second terminal setup, this is what you should do
```
______________________________________________________________________________________________
| $> rm -rf ./artifacts/remote_ganache/ && \                                                 |
|    env T721_CONFIG=./config.ganache.remote.json gulp network::clean contracts::clean && \  |
|    env T721_CONFIG=./config.ganache.remote.json gulp network::run && \                     |
|    env T721_CONFIG=./config.ganache.remote.json gulp contracts::run && \
|    env T721_CONFIG=./config.ganache.remote.json ..                                         |
|                                                                                            |
|                                                                                            |
|                                                                                            |
|                                                                                            |
|                                                                                            |
|____________________________________________________________________________________________|
| $> cd modules/@backend_migrations && \                                                     |
|    env CASSANDRA_HOSTS=127.0.0.1 CASSANDRA_PORT=32702 ELASTICSEARCH_HOST=127.0.0.1:32610 \ |
|    ./migrate.sh                                                                            |
|                                                                                            |
|                                                                                            |
|                                                                                            |
|                                                                                            |
|                                                                                            |
|                                                                                            |
|                                                                                            |
|____________________________________________________________________________________________|
```

Now that you picture how to set things up, this is my advice for you. Create some presets that you can trigger from a shortcut. To give you an example, all I do in the morning is open iTerm2, press `ctrl + shift + w` for the first setup to open, wait 1 minute for elassandra to be ready, then press `ctrl + shift + e` to run the second setup, and once the scripts are done, I'm ready to start the server ! If you are using iTerm2 too, have a look at Arrangements and learn how to setup yours: https://blog.andrewray.me/how-to-create-custom-iterm2-window-arrangments/.

We can now finally start the server and the worker:

```
# starts the server
nest start server

# starts the server in watch mode
nest start server --watch
```

```
# starts the worker
nest start worker

# starts the worker in watch mode
nest start worker --watch
```

Visit http://localhost:3000/api and you should see a swagger interface !


