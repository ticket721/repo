[@ticket721_repo/network_engine](../README.md) › [GanacheConfig](ganacheconfig.md)

# Interface: GanacheConfig

Interface used to configure new Ganache instances.

**`example`** 
```
{
    "mnemonic": "cross uniform panic climb universe awful surprise list dutch ability label cat",
    "image": "trufflesuite/ganache-cli",
    "version": "v6.3.0",
    "container_name": "t721-ethnode",
    "gasLimit": "0xffffffffff",
    "gasPrice": "0x2540BE400"
}
```

## Hierarchy

* **GanacheConfig**

## Index

### Properties

* [container_name](ganacheconfig.md#container_name)
* [gasLimit](ganacheconfig.md#gaslimit)
* [gasPrice](ganacheconfig.md#gasprice)
* [image](ganacheconfig.md#image)
* [mnemonic](ganacheconfig.md#mnemonic)
* [version](ganacheconfig.md#version)

## Properties

###  container_name

• **container_name**: *string*

*Defined in [network/config/GanacheConfig.ts:38](https://github.com/ticket721/repo/blob/8d2bda3/network/config/GanacheConfig.ts#L38)*

Name given to the created docker container

___

###  gasLimit

• **gasLimit**: *string*

*Defined in [network/config/GanacheConfig.ts:43](https://github.com/ticket721/repo/blob/8d2bda3/network/config/GanacheConfig.ts#L43)*

Gas limit per block. Value as Hex String.

___

###  gasPrice

• **gasPrice**: *string*

*Defined in [network/config/GanacheConfig.ts:48](https://github.com/ticket721/repo/blob/8d2bda3/network/config/GanacheConfig.ts#L48)*

Gas Price. Value as Hex String.

___

###  image

• **image**: *string*

*Defined in [network/config/GanacheConfig.ts:28](https://github.com/ticket721/repo/blob/8d2bda3/network/config/GanacheConfig.ts#L28)*

Docker Image name to use for the Ganache container that will be created.

___

###  mnemonic

• **mnemonic**: *string*

*Defined in [network/config/GanacheConfig.ts:23](https://github.com/ticket721/repo/blob/8d2bda3/network/config/GanacheConfig.ts#L23)*

The mnemonic (12 word list) that will be used to generated the 10 first accounts.
Each account will have 100 test ethers.

___

###  version

• **version**: *string*

*Defined in [network/config/GanacheConfig.ts:33](https://github.com/ticket721/repo/blob/8d2bda3/network/config/GanacheConfig.ts#L33)*

Docker Image version to use for the Ganache container that will be created.
