#!/usr/bin/env bash

kubectl get pods --all-namespaces -o jsonpath="{..image}" |\
     tr -s '[[:space:]]' '\n' |\
     sort |\
     uniq |\
     xargs -n 1 echo 'docker pull'

