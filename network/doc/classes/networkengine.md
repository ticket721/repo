[@ticket721_repo/network_engine](../README.md) › [NetworkEngine](networkengine.md)

# Class: NetworkEngine

Network Engine, used to consume `NetworkConfiguration` objects and do the following:

- Run and check if any instance should be created in a Docker container, performs liveness check and saves configuration to portal
- Clean all performed actions

## Hierarchy

* [Engine](engine.md)‹[NetworkConfig](../interfaces/networkconfig.md)›

  ↳ **NetworkEngine**

## Index

### Constructors

* [constructor](networkengine.md#constructor)

### Properties

* [config](networkengine.md#config)
* [name](networkengine.md#name)

### Methods

* [clean](networkengine.md#clean)
* [run](networkengine.md#run)

## Constructors

###  constructor

\+ **new NetworkEngine**(`config`: [NetworkConfig](../interfaces/networkconfig.md), `name`: string): *[NetworkEngine](networkengine.md)*

*Defined in [network/NetworkEngine.ts:23](https://github.com/ticket721/repo/blob/1f3415f/network/NetworkEngine.ts#L23)*

**Parameters:**

Name | Type |
------ | ------ |
`config` | [NetworkConfig](../interfaces/networkconfig.md) |
`name` | string |

**Returns:** *[NetworkEngine](networkengine.md)*

## Properties

###  config

• **config**: *[NetworkConfig](../interfaces/networkconfig.md)*

*Inherited from [Engine](engine.md).[config](engine.md#config)*

*Defined in [gulp/config/index.ts:18](https://github.com/ticket721/repo/blob/1f3415f/gulp/config/index.ts#L18)*

___

###  name

• **name**: *string*

*Inherited from [Engine](engine.md).[name](engine.md#name)*

*Defined in [gulp/config/index.ts:19](https://github.com/ticket721/repo/blob/1f3415f/gulp/config/index.ts#L19)*

## Methods

###  clean

▸ **clean**(): *Promise‹void›*

*Overrides [Engine](engine.md).[clean](engine.md#abstract-clean)*

*Defined in [network/NetworkEngine.ts:103](https://github.com/ticket721/repo/blob/1f3415f/network/NetworkEngine.ts#L103)*

Cleans any work previously done by the `run` method. Should never crash, even if nothing to clean.

**Returns:** *Promise‹void›*

___

###  run

▸ **run**(): *Promise‹void›*

*Overrides [Engine](engine.md).[run](engine.md#abstract-run)*

*Defined in [network/NetworkEngine.ts:51](https://github.com/ticket721/repo/blob/1f3415f/network/NetworkEngine.ts#L51)*

Main method, used to raise any Docker container if need (if `type` is `ganache` or `geth`). Then performs
liveness check by retrieving current network ID and check if it matches provided one. Finally writes configuration
to portal, making it accessible by the Contracts Engine.

**Returns:** *Promise‹void›*
