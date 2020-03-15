## Ticket721 Monorepo

| Name | Status |
| :---: | :---: |
| Codecov | [![codecov](https://codecov.io/gh/ticket721/repo/branch/develop/graph/badge.svg)](https://codecov.io/gh/ticket721/repo) |
| Github Actions | ![T721 Monorepo CI](https://github.com/ticket721/repo/workflows/T721%20Monorepo%20CI/badge.svg) |

## Introduction

This Monorepo contains all code and tools required by Ticket721 to operate all sections of its infrastructure. The Monorepo architecture was an obvious choice for us as we work with Typescript on most of our stack, making code reusability really great.

### Lerna & Yarn

We are using both Lerna and Yarn to power our monorepo. The Yarn workspaces are helping us factorize all the dependencies of the monorepo into one major `node_modules`. Lerna provides a really easy to use cli to operate all the modules.

### Modules

The Monorepo is composed of several types of modules. All of the modules can be found in the `modules` directory.

#### `@public` modules

These modules are actually git submodules. The reason behind this is that they are public tools, and are published on some public repositories (`npm`, `docker hub`, ...). This type of module is different from all the others, they are not handles by Lerna or Yarn as part of the Monorepo for a simple reason: we need their dependencies installed properly and not factorized in order to have a good and up-to-date lockfile shipped with the published content. This is why we are installing them individually.

#### `@contracts` modules

These modules contain smart contracts used by Ticket721. They also are git submodules because we need to make them public. The reason behind this is that any smart contract published on a public ledger should be verifiable, and we make sure it is by providing the actual code of the contract. The difference with the `@public` modules is that they are registered as part of the monorepo and their dependencies are factorized with the rest of the modules, simply because the need for an up-to-date lockfile is not that important (all dependencies are mostly development tools for Smart Contracts).

#### `@common` modules

These modules contain code, libraries, or anything that is used in at least 2 other modules. These modules should be used as much as possible and without restriction to enhance code reusability.

#### `@backend` modules

These modules contain code, scripts and utilities used to operate the backend section of the infrastructure. Infrastructure configuration should not be part of it. Everything around our servers (api, workers, development scripts, migrations) should be included into `@backend`.

#### `@frontend` modules

These modules contain code, scripts and utilities used to operate the frontend section of the infrastructure. It will mainly be composed of the application served on client side, their components, configurations, etc ...

#### `@infra` modules

These modules should contain infrastructure related configuration, scripts and resources. Instead of having one huge deployment configuration, we prefer to cut things into several entities, each with its ability to properly scal independently from others.

#### The engines

Some code is located outside the `modules` directory. The `gulp`, `network` and `contracts` directories mainly contain code used for task running, and managing ethereum smart contracts deployments in a better manner (multi truffle project).

## Setup

### Required dependencies

In order for you to properly use the monorepo, you will have to install `lerna` and `yarn` (and `node` obviously) globally.

Simply run the following command to get started

```
npm install --global lerna yarn
```

### First time cloning ?

When you barely cloned the repository, you have to fetch the submodules before installing anything. Run the following to fetch and checkout all submodules

```
yarn setup:submodules:clone && yarn @install
```

After this you should be ready to do anything on any module of the repo. If this is not the case, this means that there is a configuration error that should be fixed.

### Want to clear everything and reinstall all dependencies ?

We are using automated dependency checkers that are raising PRs with dependency updates. Our CI being pretty robust, we automatically merge these PRs. This means that you will often have to pull updates from the main branch, and you will often need to update localy installed packages.

```
yarn @clean && yarn @install
```

This command should completely reset the repository and install all required (and up-to-date) dependencies.

If you are on a fresh commit (*no unstaged changes*), you can run the following command instead to prevent useless lockfiles updates

```
yarn @clean && yarn @install && git reset --hard
```

Remember, this second solution will remove all changegs that haven't been comitted, so use it wisely.

## Module Roots

| Section | Description |
| :---: | :---: |
| [`@public`](./modules/@public.md) | Public NPM modules |
| [`@contracts`](./modules/@contracts.md) | Ethereum Smart Contracts |
| [`@common`](./modules/@common.md) | Common and Shared code & utilities |
| [`@backend`](./modules/@backend.md) | Backend related code & utilities |
| [`@frontend`](./modules/@frontend.md) | Frontend related code & utilities |
| [`@infra`](./modules/@infra.md) | Infrastructure related configurations & utilities |

## Gulp Tasks

| Command | Description | Env | Dependencies |
| :---: | :---: | :---: | :---: |
| `network::run` | Reads the provided configuration and setups everything. If the config is set to `ganache` or `geth`, a docker container will be created. Everything is finally written in the `network.json` file in the portal | `T721_CONFIG` | |
| `network::clean` | Reads the provided configuration and cleans everything that is network engine related. | `T721_CONFIG` | |
| `contracts::run` | Reads the provided configuration and runs contracts tests, migrations and post-migrations. Everything is saved to the portal. | `T721_CONFIG` | `network::run` |
| `contracts::clean` | Reads the provided configuration and cleans everything that is network engine related. | `T721_CONFIG` | |
| `server::dev::prepare` | Automatically performs manual configuration steps when running the server locally | `T721_CONFIG` | |

