<p align="center">
  <img src=".assets/logo.png">
</p>

## Introduction

This Monorepo contains the infrastructure of the T721 Platform.

## Table of Contents

| Section | Description |
| :---: | :---: |
| [`modules`](./modules/README.md) | Public NPM modules |
| [`network`](./network/README.md) | Network Engine Sources |
| [`contracts`](./contracts/README.md) | Contracts Engine Sources |
| [`env`](./env/README.md) | Helm T721 Infrastructure Configuration |
| [`sources`](./sources/README.md) | T721 Components sources (server, apps, services) |

## Setup

```shell

# clone repository
git clone git@github.com:ticket721/repo.git
cd repo

# setup submodules
npm run setup

# install dependencies
npm install

# install lerna modules dependencies
npm run bootstrap

```

## Gulp

| Command | Description | Env | Dependencies |
| :---: | :---: | :---: | :---: |
| `network::run` | Reads the provided configuration and setups everything. If the config is set to `ganache` or `geth`, a docker container will be created. Everything is finally written in the `network.json` file in the portal | `T721_CONFIG` | |
| `network::clean` | Reads the provided configuration and cleans everything that is network engine related. | `T721_CONFIG` | |
| `contracts::run` | Reads the provided configuration and runs contracts tests, migrations and post-migrations. Everything is saved to the portal. | `T721_CONFIG` | `network::run` |
| `contracts::clean` | Reads the provided configuration and cleans everything that is network engine related. | `T721_CONFIG` | |

## Status

| Name | Status |
| :---: | :---: |
| Codecov | [![codecov](https://codecov.io/gh/ticket721/repo/branch/develop/graph/badge.svg)](https://codecov.io/gh/ticket721/repo) |
| Github Actions | ![T721 Monorepo CI](https://github.com/ticket721/repo/workflows/T721%20Monorepo%20CI/badge.svg) |



