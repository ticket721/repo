#!/usr/bin/env bash

#####################################################

echo "Revert 0004/Add Elasticsearch Actionset Consumed Field"
cd elasticsearch
env npx elastic-migrate down 20200624081627

if [ ! $? -eq 0 ]
then
  echo "An error occured while reverting an elasticsearch migration step (20200624081627)"
  exit 1
fi

cd ..
echo "0004/END"
echo

sleep 1

#####################################################

echo
echo "Revert 0003/Add Cassandra Actionset Consumed Field"
export CASSANDRA_KEYSPACE="ticket721"

cd cassandra
npx cassandra-migrate down -o ./options.js -n 1592986280

if [ ! $? -eq 0 ]
then
  echo "An error occured while reverting a cassandra migration step (1592986280)"
  exit 1
fi

cd ..
echo "0003/END"
echo

sleep 1

#####################################################

echo "Revert 0002/Create Initial Elasticsearch Setup"
cd elasticsearch
env npx elastic-migrate down 20191216075937

if [ ! $? -eq 0 ]
then
  echo "An error occured while reverting an elasticsearch migration step (20191216075937)"
  exit 1
fi

cd ..
echo "0002/END"
echo

sleep 1

#####################################################

echo
echo "Revert 0001/Create Initial Cassandra Setup"
export CASSANDRA_KEYSPACE="ticket721"

cd cassandra
npx cassandra-migrate down -o ./options.js -n 1576415205

if [ ! $? -eq 0 ]
then
  echo "An error occured while reverting a cassandra migration step (1576415205)"
  exit 1
fi

cd ..
echo "0001/END"
echo


