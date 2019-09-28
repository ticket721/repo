import { array, boolean, Decoder, object }                   from '@mojotech/json-type-validation';
import { ContractsModuleConfig, ContractsModuleConfigGuard } from './ContractsModuleConfig';

export interface ContractsConfig {
    modules: ContractsModuleConfig[];
    artifacts: boolean;
}

export const ContractsConfigGuard: Decoder<ContractsConfig> = object({
    modules: array(ContractsModuleConfigGuard),
    artifacts: boolean()
});
