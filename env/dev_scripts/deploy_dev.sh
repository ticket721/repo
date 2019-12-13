#!/usr/bin/env bash

echo "Installing"
helm install "$1" . \
--timeout=1200s

sentry_pswd=$(kubectl get secret --namespace default "$1-sentry" -o jsonpath="{.data.user-password}" | base64 --decode)

echo "Sentry Credentials"
echo "Username admin@sentry.local"
echo "Password ${sentry_pswd}"
echo
echo "Grafana Credentials"
echo "Username admin"
echo "Password admin"
echo
minikube service list

