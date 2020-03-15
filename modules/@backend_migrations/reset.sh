#!/usr/bin/env bash

echo "Revert 0002/Create Initial Elasticsearch Setup"
cd elasticsearch
env npx elastic-migrate down 20191216075937
cd ..
echo "0002/END"
echo

sleep 1

echo
echo "Revert 0001/Create Initial Cassandra Setup"
export CASSANDRA_KEYSPACE="ticket721"

cd cassandra
npx cassandra-migrate down -o ./options.js -n 1576415205
cd ..
echo "0001/END"
echo


