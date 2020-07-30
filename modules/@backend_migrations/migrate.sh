#!/bin/bash

echo "Cassandra Initial Keyspace Checks & Setup"
cd cassandra && node keyspace.js && cd ..

if [ ! $? -eq 0 ]
then
  echo "An error occured while doing the cassandra keyspace initial setup"
  sleep 30; exit 1
fi

echo "Elasticsearch Initial Migration Index Setup"
npx elastic-migrate setup

if [ ! $? -eq 0 ]
then
  echo "An error occured while doing the elasticsearch keyspace initial setup"
  sleep 30; exit 1
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
  sleep 30; exit 1
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
  sleep 30; exit 1
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
  sleep 30; exit 1
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
  sleep 30; exit 1
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
  sleep 30; exit 1
fi

cd ..
echo "0005/END"
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
  sleep 30; exit 1
fi

cd ..
echo "0006/END"
echo

sleep 1

###########################################################

echo
echo "0007/ Add missing ticket mapping and metadata sync settings"
cd elasticsearch
npm run elastic-migrate-up 20200715201757

if [ ! $? -eq 0 ]
then
  echo "An error occured on an elasticsearch migration step (20200715201757)"
  sleep 30; exit 1
fi

cd ..
echo "0007/END"
echo

sleep 1

###########################################################

echo
echo "0008/Cassandra Tx Real Trsanction Hash Field"
export CASSANDRA_KEYSPACE="ticket721"

cd cassandra
npm run cassandra-migrate-up 1595338599

if [ ! $? -eq 0 ]
then
  echo "An error occured on a cassandra migration step (1595338599)"
  sleep 30; exit 1
fi

cd ..
echo "0008/END"
echo

sleep 1

###########################################################

echo
echo "0009/Elasticsearch Tx Real Transaction Hash Field"
cd elasticsearch
npm run elastic-migrate-up 20200721134007

if [ ! $? -eq 0 ]
then
  echo "An error occured on an elasticsearch migration step (20200721134007)"
  sleep 30; exit 1
fi

cd ..
echo "0009/END"
echo

sleep 1

###########################################################

echo
echo "0010/Cassandra Create Stripe Interface"
export CASSANDRA_KEYSPACE="ticket721"

cd cassandra
npm run cassandra-migrate-up 1595938079

if [ ! $? -eq 0 ]
then
  echo "An error occured on a cassandra migration step (1595938079)"
  sleep 30; exit 1
fi

cd ..
echo "0010/END"
echo

sleep 1

###########################################################

echo
echo "0011/Elasticsearch Create Stripe Interface"
cd elasticsearch
npm run elastic-migrate-up 20200728121356

if [ ! $? -eq 0 ]
then
  echo "An error occured on an elasticsearch migration step (20200728121356)"
  sleep 30; exit 1
fi

cd ..
echo "0011/END"
echo

sleep 1


