[@ticket721_repo/network_engine](../README.md) › [HDWalletProviderConfig](hdwalletproviderconfig.md)

# Interface: HDWalletProviderConfig

Configuration for the HDWalletProvider deployment mode.
This configuration is required when deploying to live
networks. It can unlocks accounts from a certain mnemonic.

## Hierarchy

* **HDWalletProviderConfig**

## Index

### Properties

* [account_index](hdwalletproviderconfig.md#optional-account_index)
* [account_number](hdwalletproviderconfig.md#optional-account_number)
* [derivation_path](hdwalletproviderconfig.md#optional-derivation_path)
* [mnemonic](hdwalletproviderconfig.md#mnemonic)
* [type](hdwalletproviderconfig.md#type)

## Properties

### `Optional` account_index

• **account_index**? : *number*

Defined in contracts/config/ProviderConfigs.ts:28

Index of the account to use as the coinbase account

___

### `Optional` account_number

• **account_number**? : *number*

Defined in contracts/config/ProviderConfigs.ts:33

Amount of accounts to unlock

___

### `Optional` derivation_path

• **derivation_path**? : *string*

Defined in contracts/config/ProviderConfigs.ts:38

Specify a custom derivation path if required

___

###  mnemonic

• **mnemonic**: *string*

Defined in contracts/config/ProviderConfigs.ts:23

Mnemonic tu use to recover the account(s)

___

###  type

• **type**: *"http" | "hdwallet"*

Defined in contracts/config/ProviderConfigs.ts:18
