[@ticket721_repo/network_engine](../README.md) › [NetworkConfig](networkconfig.md)

# Interface: NetworkConfig

Configuration required for the network engine module.

**`example`** 
```
{
     "type": "ganache",
     "host": "127.0.0.1",
     "port": 8545,
     "protocol": "http",
     "network_id": 2702,

     "config": {
         "mnemonic": "cross uniform panic climb universe awful surprise list dutch ability label cat",
         "image": "trufflesuite/ganache-cli",
         "version": "v6.3.0",
         "container_name": "t721-ethnode",
         "gasLimit": "0xffffffffff",
         "gasPrice": "0x2540BE400"
     }

}
```

## Hierarchy

* **NetworkConfig**

## Index

### Properties

* [config](networkconfig.md#config)
* [host](networkconfig.md#host)
* [network_id](networkconfig.md#network_id)
* [path](networkconfig.md#optional-path)
* [port](networkconfig.md#port)
* [protocol](networkconfig.md#protocol)
* [type](networkconfig.md#type)

## Properties

###  config

• **config**: *[GanacheConfig](ganacheconfig.md) | [GethConfig](gethconfig.md) | [RemoteConfig](remoteconfig.md)*

*Defined in [network/config/NetworkConfig.ts:65](https://github.com/ticket721/repo/blob/1f3415f/network/config/NetworkConfig.ts#L65)*

In-depth configuration depending on provided `type`

___

###  host

• **host**: *string*

*Defined in [network/config/NetworkConfig.ts:40](https://github.com/ticket721/repo/blob/1f3415f/network/config/NetworkConfig.ts#L40)*

Hostname of the node

___

###  network_id

• **network_id**: *number*

*Defined in [network/config/NetworkConfig.ts:60](https://github.com/ticket721/repo/blob/1f3415f/network/config/NetworkConfig.ts#L60)*

Network ID of the node

___

### `Optional` path

• **path**? : *string*

*Defined in [network/config/NetworkConfig.ts:50](https://github.com/ticket721/repo/blob/1f3415f/network/config/NetworkConfig.ts#L50)*

Extra path if endpoint is not on root

___

###  port

• **port**: *number*

*Defined in [network/config/NetworkConfig.ts:45](https://github.com/ticket721/repo/blob/1f3415f/network/config/NetworkConfig.ts#L45)*

JSON-RPC port on the node

___

###  protocol

• **protocol**: *"http" | "https"*

*Defined in [network/config/NetworkConfig.ts:55](https://github.com/ticket721/repo/blob/1f3415f/network/config/NetworkConfig.ts#L55)*

Communication procotol

___

###  type

• **type**: *"ganache" | "geth" | "remote"*

*Defined in [network/config/NetworkConfig.ts:35](https://github.com/ticket721/repo/blob/1f3415f/network/config/NetworkConfig.ts#L35)*

Network configuration type
