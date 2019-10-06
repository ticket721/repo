[@ticket721_repo/network_engine](../README.md) › [ContractsModuleConfig](contractsmoduleconfig.md)

# Interface: ContractsModuleConfig

Configuration for a specific contracts module

## Hierarchy

* **ContractsModuleConfig**

## Index

### Properties

* [active](contractsmoduleconfig.md#active)
* [arguments](contractsmoduleconfig.md#optional-arguments)
* [name](contractsmoduleconfig.md#name)
* [recover](contractsmoduleconfig.md#recover)
* [test](contractsmoduleconfig.md#test)

## Properties

###  active

• **active**: *boolean*

*Defined in [contracts/config/ContractsModuleConfig.ts:16](https://github.com/ticket721/repo/blob/1f3415f/contracts/config/ContractsModuleConfig.ts#L16)*

If module should be deployed during migration or ignored

___

### `Optional` arguments

• **arguments**? : *string | number[]*

*Defined in [contracts/config/ContractsModuleConfig.ts:35](https://github.com/ticket721/repo/blob/1f3415f/contracts/config/ContractsModuleConfig.ts#L35)*

Optional arguments that are injected into the truffle-config.js in
the extra-config section. Can be recovered in the migration files
and used as pleased.

___

###  name

• **name**: *string*

*Defined in [contracts/config/ContractsModuleConfig.ts:11](https://github.com/ticket721/repo/blob/1f3415f/contracts/config/ContractsModuleConfig.ts#L11)*

Name of the module. Should match the directory name
in the contracts_modules directory

___

###  recover

• **recover**: *boolean*

*Defined in [contracts/config/ContractsModuleConfig.ts:23](https://github.com/ticket721/repo/blob/1f3415f/contracts/config/ContractsModuleConfig.ts#L23)*

If artifacts should be recovered and placed into the contracts
modules. Truffle will find out at what point in the migration
we are and will continue from there only.

___

###  test

• **test**: *boolean*

*Defined in [contracts/config/ContractsModuleConfig.ts:28](https://github.com/ticket721/repo/blob/1f3415f/contracts/config/ContractsModuleConfig.ts#L28)*

If tests should be launched before deploying anything
