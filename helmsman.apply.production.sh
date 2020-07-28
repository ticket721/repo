#! /bin/bash

cd modules/@infra_helmsman-prod

env CONTEXT=$(kubectl config current-context) \
CONFIG_STAGING_EFS_ID=$(aws efs describe-file-systems --output json | jq '.FileSystems[] | select(.Tags[].Key=="Cluster" and .Tags[].Value=="euw-prod")' | jq '.FileSystemId' | tr -d '"') \
TAG=${GITHUB_SHA} \
helmsman --apply -f ./state.yaml
