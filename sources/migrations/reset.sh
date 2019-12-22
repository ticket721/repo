#!/usr/bin/env bash

echo "Revert 0004/Create Web3Token Index in ElasticSearch"
cd elasticsearch
env npx elastic-migrate down 20191221103957
cd ..
echo "0004/END"
echo

sleep 1

echo
echo "Revert 0003/Create Web3Token Table in Cassandra"
export CASSANDRA_KEYSPACE="ticket721"

cd cassandra
npx cassandra-migrate down -o ./options.js -n 1576924519
cd ..
echo "0003/END"
echo

sleep 1

echo "Revert 0002/Create User Index in ElasticSearch"
cd elasticsearch
env npx elastic-migrate down 20191216075937
cd ..
echo "0002/END"
echo

sleep 1

echo
echo "Revert 0001/Create User Table in Cassandra"
export CASSANDRA_KEYSPACE="ticket721"

cd cassandra
npx cassandra-migrate down -o ./options.js -n 1576415205
cd ..
echo "0001/END"
echo


