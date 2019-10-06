[@ticket721_repo/network_engine](../README.md) › [ContractsConfig](contractsconfig.md)

# Interface: ContractsConfig

Configuration required for the contracts engine module.

**`example`** 
```
{

    "modules": [
        {
            "name": "daiplus",
            "recover": false,
            "active": true,
            "test": false,
            "arguments": [
                "DaiPlus Local Meta-Stablecoin v1.0",
                "Dai+",
                18
            ]
        }
    ],
    "artifacts": true,
    "provider": {
        "type": "hdwallet",
        "mnemonic": "cross uniform panic climb universe awful surprise list dutch ability label cat",
        "account_index": 0,
        "account_number": 10
    }

}
```

## Hierarchy

* **ContractsConfig**

## Index

### Properties

* [artifacts](contractsconfig.md#artifacts)
* [modules](contractsconfig.md#modules)
* [post_migration](contractsconfig.md#optional-post_migration)
* [provider](contractsconfig.md#provider)

## Properties

###  artifacts

• **artifacts**: *boolean*

*Defined in [contracts/config/ContractsConfig.ts:56](https://github.com/ticket721/repo/blob/1f3415f/contracts/config/ContractsConfig.ts#L56)*

Determines if artifacts should be preserved in the artifacts directory.
Very useful in production, artifacts can be pushed to VCS and migration
can recover the previously created artifacts for a configuration to
properly continue deployments.

___

###  modules

• **modules**: *[ContractsModuleConfig](contractsmoduleconfig.md)[]*

*Defined in [contracts/config/ContractsConfig.ts:48](https://github.com/ticket721/repo/blob/1f3415f/contracts/config/ContractsConfig.ts#L48)*

Contracts modules. Should be found in the contracts_modules directory.
These modules have a special truffle-config.js that will try to fetch
informations from the T721 env if it finds any.

___

### `Optional` post_migration

• **post_migration**? : *[PostMigrationConfigs](../README.md#postmigrationconfigs)*

*Defined in [contracts/config/ContractsConfig.ts:69](https://github.com/ticket721/repo/blob/1f3415f/contracts/config/ContractsConfig.ts#L69)*

Actions to trigger once the migration is complete.
ex: Etherscan Contract Verification

___

###  provider

• **provider**: *[HttpProviderConfig](httpproviderconfig.md) | [HDWalletProviderConfig](hdwalletproviderconfig.md)*

*Defined in [contracts/config/ContractsConfig.ts:63](https://github.com/ticket721/repo/blob/1f3415f/contracts/config/ContractsConfig.ts#L63)*

Provider to use to connect to the node. The node information are
fetched from the portal and directly injected into the truffle-config.js of
the contracts_modules
