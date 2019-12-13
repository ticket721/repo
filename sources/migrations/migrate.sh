#!/usr/bin/env bash

echo "Cassandra Initial Keyspace Checks & Setup"
cd cassandra && node keyspace.js && cd ..

echo "Elasticsearch Initial Migration Index Setup"
npx elastic-migrate setup


echo
echo "0001/Create User Table in Cassandra"
export CASSANDRA_KEYSPACE="ticket721"

cd cassandra/user && npx cassandra-migrate up -o ../options.js -n 1576415205 && cd ../..
echo "0001/END"
echo

echo "0002/Create User Index in ElasticSearch"
export VERSION="20191216075937"
cd elasticsearch/user && npx elastic-migrate up && cd ../..
echo "0002/END"
echo

