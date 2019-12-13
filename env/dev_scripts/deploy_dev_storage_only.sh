#!/usr/bin/env bash

echo "Installing"
helm install "$1" . \
--set monitoring.prometheus.enabled=false \
--set monitoring.sentry.enabled=false \
--set storage.elassandra.service.cassandra.type=NodePort \
--set storage.elassandra.service.elasticsearch.type=NodePort \
--timeout=1200s

echo

minikube service list

echo "Leave this terminal open"

