[@ticket721_repo/network_engine](README.md)

# @ticket721_repo/network_engine

## Index

### Classes

* [Engine](classes/engine.md)
* [NetworkEngine](classes/networkengine.md)

### Interfaces

* [GanacheConfig](interfaces/ganacheconfig.md)
* [GethConfig](interfaces/gethconfig.md)
* [NetworkConfig](interfaces/networkconfig.md)
* [T721Config](interfaces/t721config.md)

### Variables

* [GanacheConfigGuard](README.md#const-ganacheconfigguard)
* [GethConfigGuard](README.md#const-gethconfigguard)
* [NetworkConfigGuard](README.md#const-networkconfigguard)
* [core_log](README.md#const-core_log)
* [network_log](README.md#const-network_log)
* [repo_log](README.md#const-repo_log)

### Functions

* [GanacheCleaner](README.md#ganachecleaner)
* [GanacheRunner](README.md#ganacherunner)
* [GethCleaner](README.md#gethcleaner)
* [GethRunner](README.md#gethrunner)
* [check_network_portal](README.md#check_network_portal)
* [clean_portal](README.md#clean_portal)
* [eth_node_check_net_id](README.md#eth_node_check_net_id)
* [eth_node_liveness_check](README.md#eth_node_liveness_check)
* [from_root](README.md#from_root)
* [kill_container](README.md#kill_container)
* [print_config](README.md#print_config)
* [pull_image](README.md#pull_image)
* [run_ganache](README.md#run_ganache)
* [run_geth](README.md#run_geth)
* [save_portal](README.md#save_portal)

## Variables

### `Const` GanacheConfigGuard

• **GanacheConfigGuard**: *Decoder‹[GanacheConfig](interfaces/ganacheconfig.md)›* =  object({
    mnemonic: string(),
    image: string(),
    version: string(),
    container_name: string(),
    gasLimit: string(),
    gasPrice: string()
})

*Defined in [network/config/GanacheConfig.ts:54](https://github.com/ticket721/repo/blob/8d2bda3/network/config/GanacheConfig.ts#L54)*

TypeGuard instance to check provided JSON configs.

___

### `Const` GethConfigGuard

• **GethConfigGuard**: *Decoder‹[GethConfig](interfaces/gethconfig.md)›* =  object({
    mnemonic: string(),
    image: string(),
    version: string(),
    container_name: string(),
    accounts: number()
})

*Defined in [network/config/GethConfig.ts:48](https://github.com/ticket721/repo/blob/8d2bda3/network/config/GethConfig.ts#L48)*

TypeGuard instance to check provided JSON configs.

___

### `Const` NetworkConfigGuard

• **NetworkConfigGuard**: *Decoder‹[NetworkConfig](interfaces/networkconfig.md)›* =  object({
    config: oneOf<GanacheConfig | GethConfig>(GanacheConfigGuard, GethConfigGuard),
    type: oneOf(constant('ganache'), constant('geth'), constant('remote')),
    protocol: oneOf(constant('http'), constant('https')),
    host: string(),
    port: number(),
    network_id: number(),
})

*Defined in [network/config/NetworkConfig.ts:65](https://github.com/ticket721/repo/blob/8d2bda3/network/config/NetworkConfig.ts#L65)*

TypeGuard instance to check provided JSON configs.

___

### `Const` core_log

• **core_log**: *Signale* =  new Signale(config as any)

*Defined in [gulp/utils/log.ts:36](https://github.com/ticket721/repo/blob/8d2bda3/gulp/utils/log.ts#L36)*

Core log entity, should be scoped in each used module

___

### `Const` network_log

• **network_log**: *Signale* =  core_log.scope('🛰')

*Defined in [network/utils/network_log.ts:7](https://github.com/ticket721/repo/blob/8d2bda3/network/utils/network_log.ts#L7)*

Network Logging Utility

___

### `Const` repo_log

• **repo_log**: *Signale* =  core_log.scope('📦')

*Defined in [gulp/utils/log.ts:41](https://github.com/ticket721/repo/blob/8d2bda3/gulp/utils/log.ts#L41)*

Repo log entity

## Functions

###  GanacheCleaner

▸ **GanacheCleaner**(`config`: [NetworkConfig](interfaces/networkconfig.md)): *Promise‹void›*

*Defined in [network/core/GanacheCleaner.ts:12](https://github.com/ticket721/repo/blob/8d2bda3/network/core/GanacheCleaner.ts#L12)*

Cleans any `NetworkEngine` related work, when `type` is `ganache`.

**`constructor`** 

**Parameters:**

Name | Type |
------ | ------ |
`config` | [NetworkConfig](interfaces/networkconfig.md) |

**Returns:** *Promise‹void›*

___

###  GanacheRunner

▸ **GanacheRunner**(`config`: [NetworkConfig](interfaces/networkconfig.md)): *Promise‹void›*

*Defined in [network/core/GanacheRunner.ts:14](https://github.com/ticket721/repo/blob/8d2bda3/network/core/GanacheRunner.ts#L14)*

Pulls & Runs image provided in `GanacheConfig` section.

**`constructor`** 

**Parameters:**

Name | Type |
------ | ------ |
`config` | [NetworkConfig](interfaces/networkconfig.md) |

**Returns:** *Promise‹void›*

___

###  GethCleaner

▸ **GethCleaner**(`config`: [NetworkConfig](interfaces/networkconfig.md)): *Promise‹void›*

*Defined in [network/core/GethCleaner.ts:12](https://github.com/ticket721/repo/blob/8d2bda3/network/core/GethCleaner.ts#L12)*

Cleans any `NetworkEngine` related work, when `type` is `geth`.

**`constructor`** 

**Parameters:**

Name | Type |
------ | ------ |
`config` | [NetworkConfig](interfaces/networkconfig.md) |

**Returns:** *Promise‹void›*

___

###  GethRunner

▸ **GethRunner**(`config`: [NetworkConfig](interfaces/networkconfig.md)): *Promise‹void›*

*Defined in [network/core/GethRunner.ts:14](https://github.com/ticket721/repo/blob/8d2bda3/network/core/GethRunner.ts#L14)*

Pulls & Runs image provided in `GethConfig` section.

**`constructor`** 

**Parameters:**

Name | Type |
------ | ------ |
`config` | [NetworkConfig](interfaces/networkconfig.md) |

**Returns:** *Promise‹void›*

___

###  check_network_portal

▸ **check_network_portal**(): *void*

*Defined in [network/utils/check_network_portal.ts:8](https://github.com/ticket721/repo/blob/8d2bda3/network/utils/check_network_portal.ts#L8)*

Utility to check if portal has been created in the network directory

**Returns:** *void*

___

###  clean_portal

▸ **clean_portal**(): *Promise‹void›*

*Defined in [network/utils/clean_portal.ts:7](https://github.com/ticket721/repo/blob/8d2bda3/network/utils/clean_portal.ts#L7)*

Utility to clean all `network` related actions from the portal

**Returns:** *Promise‹void›*

___

###  eth_node_check_net_id

▸ **eth_node_check_net_id**(`host`: string, `port`: number, `protocol`: string, `expected_net_id`: number): *Promise‹void›*

*Defined in [network/utils/eth_node_check_net_id.ts:11](https://github.com/ticket721/repo/blob/8d2bda3/network/utils/eth_node_check_net_id.ts#L11)*

Utility to check if given node has expected network id.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`host` | string | - |
`port` | number | - |
`protocol` | string | - |
`expected_net_id` | number |   |

**Returns:** *Promise‹void›*

___

###  eth_node_liveness_check

▸ **eth_node_liveness_check**(`host`: string, `port`: number, `protocol`: string): *Promise‹void›*

*Defined in [network/utils/eth_node_liveness_check.ts:10](https://github.com/ticket721/repo/blob/8d2bda3/network/utils/eth_node_liveness_check.ts#L10)*

Utility to check if node is live and able to process JSON-RPC requests.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`host` | string | - |
`port` | number | - |
`protocol` | string |   |

**Returns:** *Promise‹void›*

___

###  from_root

▸ **from_root**(`file`: string): *string*

*Defined in [gulp/utils/from_root.ts:3](https://github.com/ticket721/repo/blob/8d2bda3/gulp/utils/from_root.ts#L3)*

**Parameters:**

Name | Type |
------ | ------ |
`file` | string |

**Returns:** *string*

___

###  kill_container

▸ **kill_container**(`docker`: Dockerode, `container_name`: string): *Promise‹void›*

*Defined in [network/utils/kill_container.ts:11](https://github.com/ticket721/repo/blob/8d2bda3/network/utils/kill_container.ts#L11)*

Utility to `docker kill` the provided container

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`docker` | Dockerode | - |
`container_name` | string |   |

**Returns:** *Promise‹void›*

___

###  print_config

▸ **print_config**(`config`: [NetworkConfig](interfaces/networkconfig.md)): *void*

*Defined in [network/utils/print_config.ts:25](https://github.com/ticket721/repo/blob/8d2bda3/network/utils/print_config.ts#L25)*

Utility to log a summary of the given configuration

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`config` | [NetworkConfig](interfaces/networkconfig.md) |   |

**Returns:** *void*

___

###  pull_image

▸ **pull_image**(`docker`: Dockerode, `image`: string, `version`: string): *Promise‹void›*

*Defined in [network/utils/pull_image.ts:11](https://github.com/ticket721/repo/blob/8d2bda3/network/utils/pull_image.ts#L11)*

Utility to pull provided docker image. Resolves only when pull is complete.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`docker` | Dockerode | - |
`image` | string | - |
`version` | string |   |

**Returns:** *Promise‹void›*

___

###  run_ganache

▸ **run_ganache**(`docker`: Dockerode, `config`: [NetworkConfig](interfaces/networkconfig.md)): *Promise‹void›*

*Defined in [network/utils/run_ganache.ts:11](https://github.com/ticket721/repo/blob/8d2bda3/network/utils/run_ganache.ts#L11)*

Utility to create and run a ganache docker container.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`docker` | Dockerode | - |
`config` | [NetworkConfig](interfaces/networkconfig.md) |   |

**Returns:** *Promise‹void›*

___

###  run_geth

▸ **run_geth**(`docker`: Dockerode, `config`: [NetworkConfig](interfaces/networkconfig.md)): *Promise‹void›*

*Defined in [network/utils/run_geth.ts:13](https://github.com/ticket721/repo/blob/8d2bda3/network/utils/run_geth.ts#L13)*

Utility to create and run a ganache docker container.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`docker` | Dockerode | - |
`config` | [NetworkConfig](interfaces/networkconfig.md) |   |

**Returns:** *Promise‹void›*

___

###  save_portal

▸ **save_portal**(`config`: [NetworkConfig](interfaces/networkconfig.md)): *Promise‹void›*

*Defined in [network/utils/save_portal.ts:10](https://github.com/ticket721/repo/blob/8d2bda3/network/utils/save_portal.ts#L10)*

Utility to save configuration to portal.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`config` | [NetworkConfig](interfaces/networkconfig.md) |   |

**Returns:** *Promise‹void›*
