import { ContractsConfig }       from '../../config';
import { EtherscanVerifyAction } from '../../config/PostMigrationConfigs';
import { truffle_verify }        from '../truffle_verify';

/**
 * Main function in the EtherscanVerify PostMigration module
 *
 * @param config
 * @param etherscan_config
 * @param module_name
 * @param net_name
 * @constructor
 */
export async function EtherscanVerify(config: ContractsConfig, etherscan_config: EtherscanVerifyAction, module_name: string, net_name: string) {
    const contracts_to_verify = etherscan_config.contracts_to_verify[module_name];
    console.log(contracts_to_verify);
    if (contracts_to_verify) {
        for (const contract of contracts_to_verify) {
            await truffle_verify(contract, net_name);
        }
    }
}
