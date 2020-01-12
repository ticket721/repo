#!/usr/bin/env bash

echo "Cassandra Initial Keyspace Checks & Setup"
cd cassandra && node keyspace.js && cd ..

echo "Elasticsearch Initial Migration Index Setup"
npx elastic-migrate setup


echo
echo "0001/Create Initial Cassandra Setup"
export CASSANDRA_KEYSPACE="ticket721"

cd cassandra
npx cassandra-migrate up -o ./options.js -n 1576415205
cd ..
echo "0001/END"
echo

sleep 1

echo "0002/Create Initial ElasticSearch Setup"
cd elasticsearch
env npx elastic-migrate up 20191216075937
cd ..
echo "0002/END"
echo

