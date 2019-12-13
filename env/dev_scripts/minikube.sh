#!/usr/bin/env bash

minikube delete
minikube start --memory 8192 --cpus=2 --disk-size=100GB

./deploy_scripts/init.sh

echo "Sleeping for half a minute"
sleep 30

