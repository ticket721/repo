import { ContractsConfig } from './ContractsConfig';

export interface ScriptStepResponseFormat {
    status: string;
    artifacts: {
        name: string;
        content: string;
    }[];
}

export type ScriptStepMethod = (config: ContractsConfig, args?: any) => Promise<ScriptStepResponseFormat>;

export interface ScriptStepExportFormat {
    methods: {[key: string]: ScriptStepMethod}
}
