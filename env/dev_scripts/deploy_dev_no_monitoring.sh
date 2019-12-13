#!/usr/bin/env bash

echo "Installing"
helm install "$1" . \
--set monitoring.prometheus.enabled=false \
--set monitoring.sentry.enabled=false \
--timeout=1200s

echo

minikube service list

