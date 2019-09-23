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
* [port](networkconfig.md#port)
* [protocol](networkconfig.md#protocol)
* [type](networkconfig.md#type)

## Properties

###  config

• **config**: *[GanacheConfig](ganacheconfig.md) | [GethConfig](gethconfig.md)*

*Defined in [network/config/NetworkConfig.ts:59](https://github.com/ticket721/repo/blob/8d2bda3/network/config/NetworkConfig.ts#L59)*

In-depth configuration depending on provided `type`

___

###  host

• **host**: *string*

*Defined in [network/config/NetworkConfig.ts:39](https://github.com/ticket721/repo/blob/8d2bda3/network/config/NetworkConfig.ts#L39)*

Hostname of the node

___

###  network_id

• **network_id**: *number*

*Defined in [network/config/NetworkConfig.ts:54](https://github.com/ticket721/repo/blob/8d2bda3/network/config/NetworkConfig.ts#L54)*

Network ID of the node

___

###  port

• **port**: *number*

*Defined in [network/config/NetworkConfig.ts:44](https://github.com/ticket721/repo/blob/8d2bda3/network/config/NetworkConfig.ts#L44)*

JSON-RPC port on the node

___

###  protocol

• **protocol**: *"http" | "https"*

*Defined in [network/config/NetworkConfig.ts:49](https://github.com/ticket721/repo/blob/8d2bda3/network/config/NetworkConfig.ts#L49)*

Communication procotol

___

###  type

• **type**: *"ganache" | "geth" | "remote"*

*Defined in [network/config/NetworkConfig.ts:34](https://github.com/ticket721/repo/blob/8d2bda3/network/config/NetworkConfig.ts#L34)*

Network configuration type
