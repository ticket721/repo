import { boolean, Decoder, object, string } from '@mojotech/json-type-validation';

export interface ContractsModuleConfig {
    name: string;
    active: boolean;
    recover: boolean;
    test: boolean;
}

export const ContractsModuleConfigGuard: Decoder<ContractsModuleConfig> = object({
    name: string(),
    active: boolean(),
    recover: boolean(),
    test: boolean()
});


