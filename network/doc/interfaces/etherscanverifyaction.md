[@ticket721_repo/network_engine](../README.md) › [EtherscanVerifyAction](etherscanverifyaction.md)

# Interface: EtherscanVerifyAction

PostMigration module to run etherscan verification after deployment

## Hierarchy

* **EtherscanVerifyAction**

## Index

### Properties

* [api_key](etherscanverifyaction.md#api_key)
* [contracts_to_verify](etherscanverifyaction.md#contracts_to_verify)
* [type](etherscanverifyaction.md#type)

## Properties

###  api_key

• **api_key**: *string*

Defined in contracts/config/PostMigrationConfigs.ts:12

Etherscan API key

___

###  contracts_to_verify

• **contracts_to_verify**: *object*

Defined in contracts/config/PostMigrationConfigs.ts:26

Array of contracts to verify per contracts modules

**`example`** 
```
{
    "daiplus": [
         "DaiPlus"
    ]
}
```

#### Type declaration:

* \[ **key**: *string*\]: string[]

___

###  type

• **type**: *"etherscan_verify"*

Defined in contracts/config/PostMigrationConfigs.ts:7
