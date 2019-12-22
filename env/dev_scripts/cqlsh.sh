#!/usr/bin/env bash

release="$1"
shift

kubectl exec -it "${release}-env-0" -- cqlsh "$@"
