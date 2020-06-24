#!/bin/bash

echo "Cassandra Initial Keyspace Checks & Setup"
cd cassandra && node keyspace.js && cd ..

if [ ! $? -eq 0 ]
then
  echo "An error occured while doing the cassandra keyspace initial setup"
  exit 1
fi

echo "Elasticsearch Initial Migration Index Setup"
npx elastic-migrate setup

if [ ! $? -eq 0 ]
then
  echo "An error occured while doing the elasticsearch keyspace initial setup"
  exit 1
fi

###########################################################

echo
echo "0001/Create Initial Cassandra Setup"
export CASSANDRA_KEYSPACE="ticket721"

cd cassandra
npx cassandra-migrate up -o ./options.js -n 1576415205

if [ ! $? -eq 0 ]
then
  echo "An error occured on a cassandra migration step (1576415205)"
  exit 1
fi

cd ..
echo "0001/END"
echo

sleep 1

###########################################################

echo "0002/Create Initial ElasticSearch Setup"
cd elasticsearch
env npx elastic-migrate up 20191216075937

if [ ! $? -eq 0 ]
then
  echo "An error occured on an elasticsearch migration step (20191216075937)"
  exit 1
fi

cd ..
echo "0002/END"
echo

sleep 1

###########################################################

echo
echo "0003/Add Cassandra Actionset Consumed Field"
export CASSANDRA_KEYSPACE="ticket721"

cd cassandra
npx cassandra-migrate up -o ./options.js -n 1592986280

if [ ! $? -eq 0 ]
then
  echo "An error occured on a cassandra migration step (1592986280)"
  exit 1
fi

cd ..
echo "0003/END"
echo

sleep 1

###########################################################

echo
echo "0004/Add Elasticsearch Actionset Consumed Field"
cd elasticsearch
env npx elastic-migrate up 20200924081627

if [ ! $? -eq 0 ]
then
  echo "An error occured on an elasticsearch migration step (20200924081627)"
  exit 1
fi

cd ..
echo "0004/END"
echo


sleep 1

