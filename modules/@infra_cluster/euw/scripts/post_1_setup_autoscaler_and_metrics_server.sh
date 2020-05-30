#! /bin/bash

kubectl apply -f ./configs/autoscaler.yaml
kubectl apply -f ./configs/metrics.yaml

