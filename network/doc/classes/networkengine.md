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

### Methods

* [clean](networkengine.md#clean)
* [run](networkengine.md#run)

## Constructors

###  constructor

\+ **new NetworkEngine**(`config`: [NetworkConfig](../interfaces/networkconfig.md)): *[NetworkEngine](networkengine.md)*

*Defined in [network/NetworkEngine.ts:23](https://github.com/ticket721/repo/blob/8d2bda3/network/NetworkEngine.ts#L23)*

**Parameters:**

Name | Type |
------ | ------ |
`config` | [NetworkConfig](../interfaces/networkconfig.md) |

**Returns:** *[NetworkEngine](networkengine.md)*

## Properties

###  config

• **config**: *[NetworkConfig](../interfaces/networkconfig.md)*

*Inherited from [Engine](engine.md).[config](engine.md#config)*

*Defined in [gulp/config/index.ts:16](https://github.com/ticket721/repo/blob/8d2bda3/gulp/config/index.ts#L16)*

## Methods

###  clean

▸ **clean**(): *Promise‹void›*

*Overrides [Engine](engine.md).[clean](engine.md#abstract-clean)*

*Defined in [network/NetworkEngine.ts:102](https://github.com/ticket721/repo/blob/8d2bda3/network/NetworkEngine.ts#L102)*

Cleans any work previously done by the `run` method. Should never crash, even if nothing to clean.

**Returns:** *Promise‹void›*

___

###  run

▸ **run**(): *Promise‹void›*

*Overrides [Engine](engine.md).[run](engine.md#abstract-run)*

*Defined in [network/NetworkEngine.ts:50](https://github.com/ticket721/repo/blob/8d2bda3/network/NetworkEngine.ts#L50)*

Main method, used to raise any Docker container if need (if `type` is `ganache` or `geth`). Then performs
liveness check by retrieving current network ID and check if it matches provided one. Finally writes configuration
to portal, making it accessible by the Contracts Engine.

**Returns:** *Promise‹void›*
