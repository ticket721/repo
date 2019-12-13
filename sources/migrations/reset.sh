#!/usr/bin/env bash

echo "Revert 0002/Create User Index in ElasticSearch"
export VERSION="20191216075937"
cd elasticsearch/user && npx elastic-migrate down && cd ../..
echo "0002/END"
echo

echo
echo "Revert 0001/Create User Table in Cassandra"
export CASSANDRA_KEYSPACE="ticket721"

cd cassandra/user && npx cassandra-migrate down -o ../options.js -n 1576415205 && cd ../..
echo "0001/END"
echo


