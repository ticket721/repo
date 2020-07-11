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
npm run cassandra-migrate-up 1576415205

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
npm run elastic-migrate-up 20191216075937

if [ ! $? -eq 0 ]
then
  echo "An error occured on an elasticsearch migration step (20191216075937)"
  exit 1
fi

cd ..
echo "0002/END"
echo

sleep 1

############################################################

echo
echo "0003/Add Cassandra Actionset Consumed Field"
export CASSANDRA_KEYSPACE="ticket721"

cd cassandra
npm run cassandra-migrate-up 1592986280

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
npm run elastic-migrate-up 20200624081627

if [ ! $? -eq 0 ]
then
  echo "An error occured on an elasticsearch migration step (20200924081627)"
  exit 1
fi

cd ..
echo "0004/END"
echo

sleep 1

###########################################################

echo
echo "0005/Cassandra User Device Address Field"
export CASSANDRA_KEYSPACE="ticket721"

cd cassandra
npm run cassandra-migrate-up 1594327541

if [ ! $? -eq 0 ]
then
  echo "An error occured on a cassandra migration step (1594327541)"
  exit 1
fi

cd ..
echo "0001/END"
echo

sleep 1

###########################################################

echo
echo "0006/Elasticsearch User Device Address Field"
cd elasticsearch
npm run elastic-migrate-up 20200709204743

if [ ! $? -eq 0 ]
then
  echo "An error occured on an elasticsearch migration step (20200709204743)"
  exit 1
fi

cd ..
echo "0004/END"
echo

sleep 1

