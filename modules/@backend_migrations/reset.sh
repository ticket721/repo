#!/usr/bin/env bash

###########################################################

echo
echo "Revert 0011/Elasticsearch Create Stripe Interface"
cd elasticsearch
npm run elastic-migrate-down 20200728121356

if [ ! $? -eq 0 ]
then
  echo "An error occured on an elasticsearch migration step (20200728121356)"
  sleep 30; exit 1
fi

cd ..
echo "0011/END"
echo

sleep 1

###########################################################

echo
echo "Revert 0010/Cassandra Create Stripe Interface"
export CASSANDRA_KEYSPACE="ticket721"

cd cassandra
npm run cassandra-migrate-down 1595938079

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
echo "Revert 0009/Elasticsearch Tx Real Trsanction Hash Field"
cd elasticsearch
npm run elastic-migrate-down 20200721134007

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
echo "Revert 0008/Cassandra Tx Real Trsanction Hash Field"
export CASSANDRA_KEYSPACE="ticket721"

cd cassandra
npm run cassandra-migrate-down 1595338599

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
echo "Revert 0007/ Add missing ticket mapping and metadata sync settings"
cd elasticsearch
npm run elastic-migrate-down 20200715201757

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
echo "Revert 0006/Elasticsearch User Device Address Field"
cd elasticsearch
npm run elastic-migrate-down 20200709204743

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
echo "Revert 0005/Cassandra User Device Address Field"
export CASSANDRA_KEYSPACE="ticket721"

cd cassandra
npm run cassandra-migrate-down 1594327541

if [ ! $? -eq 0 ]
then
  echo "An error occured on a cassandra migration step (1594327541)"
  sleep 30; exit 1
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
  sleep 30; exit 1
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
  sleep 30; exit 1
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
  sleep 30; exit 1
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
  sleep 30; exit 1
fi

cd ..
echo "0001/END"
echo


