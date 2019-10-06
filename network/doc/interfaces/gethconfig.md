[@ticket721_repo/network_engine](../README.md) › [GethConfig](gethconfig.md)

# Interface: GethConfig

Interface used to configure new Ganache instances.

**`example`** 
```
{
    "mnemonic": "cross uniform panic climb universe awful surprise list dutch ability label cat",
    "image": "ticket721/test-geth",
    "version": "latest",
    "container_name": "t721-ethnode",
    "accounts": 10
}
```

## Hierarchy

* **GethConfig**

## Index

### Properties

* [accounts](gethconfig.md#accounts)
* [container_name](gethconfig.md#container_name)
* [image](gethconfig.md#image)
* [mnemonic](gethconfig.md#mnemonic)
* [version](gethconfig.md#version)

## Properties

###  accounts

• **accounts**: *number*

*Defined in [network/config/GethConfig.ts:42](https://github.com/ticket721/repo/blob/1f3415f/network/config/GethConfig.ts#L42)*

Number of account to create and unlock

___

###  container_name

• **container_name**: *string*

*Defined in [network/config/GethConfig.ts:37](https://github.com/ticket721/repo/blob/1f3415f/network/config/GethConfig.ts#L37)*

Name given to the created docker container

___

###  image

• **image**: *string*

*Defined in [network/config/GethConfig.ts:27](https://github.com/ticket721/repo/blob/1f3415f/network/config/GethConfig.ts#L27)*

Docker Image name to use for the test Geth container that will be created.

___

###  mnemonic

• **mnemonic**: *string*

*Defined in [network/config/GethConfig.ts:22](https://github.com/ticket721/repo/blob/1f3415f/network/config/GethConfig.ts#L22)*

The mnemonic (12 word list) that will be used to generated the 10 first accounts.
Each account will have 100 test ethers.

___

###  version

• **version**: *string*

*Defined in [network/config/GethConfig.ts:32](https://github.com/ticket721/repo/blob/1f3415f/network/config/GethConfig.ts#L32)*

Docker Image version to use for the test Geth container that will be created.
