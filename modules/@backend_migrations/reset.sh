#!/usr/bin/env bash

###########################################################

echo
echo "Revert 0007/ Add missing ticket mapping and metadata sync settings"
cd elasticsearch
npm run elastic-migrate-down 20200715201757

if [ ! $? -eq 0 ]
then
  echo "An error occured on an elasticsearch migration step (20200715201757)"
  exit 1
fi

cd ..
echo "0007/END"
echo

sleep 1


###########################################################

echo
echo "Revert 0006/Elasticsearch User Device Address Field"
cd elasticsearch
npm run elastic-migrate-down 20200709204743

if [ ! $? -eq 0 ]
then
  echo "An error occured on an elasticsearch migration step (20200709204743)"
  exit 1
fi

cd ..
echo "0006/END"
echo

sleep 1

###########################################################

echo
echo "Revert 0005/Cassandra User Device Address Field"
export CASSANDRA_KEYSPACE="ticket721"

cd cassandra
npm run cassandra-migrate-down 1594327541

if [ ! $? -eq 0 ]
then
  echo "An error occured on a cassandra migration step (1594327541)"
  exit 1
fi

cd ..
echo "0005/END"
echo

sleep 1


#####################################################

echo "Revert 0004/Add Elasticsearch Actionset Consumed Field"
cd elasticsearch
npm run elastic-migrate-down 20200624081627

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
npm run cassandra-migrate-down 1592986280

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
npm run elastic-migrate-down 20191216075937

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
npm run cassandra-migrate-down 1576415205

if [ ! $? -eq 0 ]
then
  echo "An error occured while reverting a cassandra migration step (1576415205)"
  exit 1
fi

cd ..
echo "0001/END"
echo


