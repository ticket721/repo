import { ScriptStepExportFormat, ScriptStepResponseFormat } from '../../contracts/config/ScriptStepExportFormat';
import { ContractsConfig }                                  from '../../contracts/config';
import { Wallet, utils }                                    from 'ethers';
import * as fs                                              from 'fs';
import { contracts_log }                                    from '../../contracts/utils/contracts_log';

async function test(config: ContractsConfig, args?: any): Promise<ScriptStepResponseFormat> {
    const minterRet: string[] = [];
    const identityRet: string[] = [];

    switch (args.mode) {
        case 'development': {
            contracts_log.info(`MinterManagement | generating 10 mock minter addresses`);
            for (let idx = 0; idx < args.count; ++idx) {
                const wallet = Wallet.createRandom();
                const address = wallet.address;
                const formattedAddress = utils.getAddress(address);
                fs.writeFileSync(`/tmp/ROCKSIDE_MOCK_EOA_${formattedAddress}`, wallet.privateKey);
                const identitywallet = Wallet.createRandom();
                const identityAddress = identitywallet.address;
                const formattedIdentityAddress = utils.getAddress(identityAddress);
                fs.writeFileSync(`/tmp/ROCKSIDE_MOCK_IDENTITY_${formattedIdentityAddress}`, formattedAddress);
                minterRet.push(formattedAddress);
                identityRet.push(formattedIdentityAddress);
                contracts_log.success(`MinterManagement | generated => ${formattedAddress}`);
            }
            contracts_log.success(`MinterManagement | generated 10 mock minter addresses`);
            break;
        }

        case 'production': {
            throw new Error(`minter management production mode not implemented`);
        }

    }

    return {
        status: null,
        artifacts: [
            {
                name: 'minters.json',
                content: JSON.stringify(minterRet, null, 4)
            },
            {
                name: 'identities.json',
                content: JSON.stringify(identityRet, null, 4)
            },
        ],
    };
}

export default {
    methods: {
        test,
    },
} as ScriptStepExportFormat;
