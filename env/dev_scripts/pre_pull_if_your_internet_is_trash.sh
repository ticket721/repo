#!/usr/bin/env bash

eval $(minikube docker-env --shell='bash')

docker pull bitnami/minideb:stretch
docker pull bitnami/postgresql:11.5.0-debian-9-r60
docker pull bitnami/redis:5.0.5-debian-9-r141
docker pull busybox:1.30
docker pull docker.io/bitnami/minideb:stretch
docker pull docker.io/bitnami/postgresql:11.5.0-debian-9-r60
docker pull docker.io/bitnami/redis:5.0.5-debian-9-r141
docker pull gcr.io/k8s-minikube/storage-provisioner:v1.8.1
docker pull grafana/grafana:6.4.2
docker pull k8s.gcr.io/coredns:1.6.2
docker pull k8s.gcr.io/etcd:3.3.15-0
docker pull k8s.gcr.io/kube-addon-manager:v9.0.2
docker pull k8s.gcr.io/kube-apiserver:v1.16.2
docker pull k8s.gcr.io/kube-controller-manager:v1.16.2
docker pull k8s.gcr.io/kube-proxy:v1.16.2
docker pull k8s.gcr.io/kube-scheduler:v1.16.2
docker pull kiwigrid/k8s-sidecar:0.1.20
docker pull kubernetesui/dashboard:v2.0.0-beta4
docker pull kubernetesui/metrics-scraper:v1.0.1
docker pull quay.io/coreos/configmap-reload:v0.0.1
docker pull quay.io/coreos/kube-state-metrics:v1.8.0
docker pull quay.io/coreos/prometheus-config-reloader:v0.34.0
docker pull quay.io/coreos/prometheus-operator:v0.34.0
docker pull quay.io/jetstack/cert-manager-cainjector:v0.12.0
docker pull quay.io/jetstack/cert-manager-controller:v0.12.0
docker pull quay.io/jetstack/cert-manager-webhook:v0.12.0
docker pull quay.io/kubernetes-ingress-controller/nginx-ingress-controller:0.26.1
docker pull quay.io/prometheus/alertmanager:v0.19.0
docker pull quay.io/prometheus/node-exporter:v0.18.1
docker pull quay.io/prometheus/prometheus:v2.13.1
docker pull sentry:9.1.2
docker pull squareup/ghostunnel:v1.4.1

eval $(docker-machine env --unset --shell='bash')
