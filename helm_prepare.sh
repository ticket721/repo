#! /bin/bash

HELM_DIRS="cert-manager efs-provisioner elassandra ingress platform redis"

helm repo add stable https://kubernetes-charts.storage.googleapis.com
helm repo add common https://kubernetes-charts-incubator.storage.googleapis.com/
helm repo add incubator https://kubernetes-charts-incubator.storage.googleapis.com/
helm repo add jetstack https://charts.jetstack.io

for dir in ${HELM_DIRS[@]}
do
    echo "Preparing module ${dir}"
    cd "modules/@infra_${dir}/${dir}"
    helm repo update
    helm dependency update
    cd "../../.."
done

