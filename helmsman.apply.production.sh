#! /bin/bash

cd modules/@infra_helmsman-prod

env CONTEXT=$(kubectl config current-context) \
TAG=${GITHUB_SHA} \
helmsman --apply -f ./state.yaml
