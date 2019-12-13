## env

### Summary

This module handles all the infrastructure of T721

### Requirements

You need to install `minikube`, `kubectl` and `helm` in order to use this configuration.

#### macOS

```bash
brew install minikube
brew install kubectl
brew install helm
```

You also have to check that you are using helm v3 (run `helm version`)

### Development

#### Start the minikube local k8s cluster

```
./dev_scripts/minikube.sh
```

#### Start the complete infrastructure locally

It might take some time to run as all the images for `grafana`, `prometheus` and `sentry` must be downloaded.

```
./dev_scripts/deploy_dev.sh any_release_name
```

#### Start the complete infrastructure locally without monitoring

monitoring === `grafana`, `prometheus`, `sentry`

This version is much faster

```
./dev_scripts/deploy_dev_no_monitoring.sh any_release_name
```

#### Start the complete infrastructure locally without monitoring, server and webapp

This version will deploy the database only. Best one if running webapp and server locally (outside of cluster) while developing.

```
TODO
```

### Production & Staging

### Known Issues

#### Sentry stupid user creation hook

The sentry helm chart has a hook that tries to create the default admin user after release installation. The issue is that the hook crashes if the user already exists. And as information is persistent inside persistent volumes, it crashes if volumes are not emptied before.

#### Slow internet = impossible to install release

The complete infrastructure requires many docker images to get pulled. If your internet is slow, your install will fail. One solution is to pull the images before by running this command (after you start the minikube cluster) :

```
./dev_scripts/pre_pull_if_your_internet_is_trash.sh
```

