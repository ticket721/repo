import { get_config }         from '../utils/get_config';
import { repo_log }           from '../utils/log';
import { ContractsEngine }    from '../../contracts';
import { check_dependencies } from '../utils/check_dependencies';
import { from_root }  from '../utils/from_root';
import * as fs        from 'fs';
const path = require('path');

export async function contracts_run(): Promise<void> {

    repo_log.info(`Starting task contracts::run`);
    console.log();

    await check_dependencies();

    const config = await get_config();

    const ne: ContractsEngine = new ContractsEngine(config.contracts, config.name);

    await ne.run();

    console.log();
    repo_log.success(`Completed task contracts::run`);
}

export async function contracts_clean(): Promise<void> {
    repo_log.info(`Starting task contracts::clean`);
    console.log();

    await check_dependencies();

    const config = await get_config();

    const ne: ContractsEngine = new ContractsEngine(config.contracts, config.name);

    await ne.clean();

    console.log();
    repo_log.success(`Completed task contracts::clean`);

}

export async function convert_artifacts() {

    const config = await get_config();
    const name = config.name;
    const netId = config.network.network_id;

    const targetPath = process.env.ARTIFACT_BUNDLE_TARGET_PATH;

    if (targetPath === undefined) {
        throw new Error(`Missing env variable ARTIFACT_BUNDLE_TARGET_PATH`)
    }

    const artifactPath = from_root(`artifacts/${name}`);

    const finalValue = {};

    const modules = fs
        .readdirSync(artifactPath)
        .filter((dirOrFile: string) => fs.statSync(path.join(artifactPath, dirOrFile)).isDirectory());

    for (const mod of modules) {

        finalValue[mod] = {
            live: {},
            lib: {}
        };

        const contractsArtifactsPath = path.join(artifactPath, mod, 'build', 'contracts');

        if (!fs.existsSync(contractsArtifactsPath)) {
            repo_log.info(`${mod} is skipped as it is not a smart contract module`);
            continue ;
        }
        repo_log.success(`${mod} is included`);

        const contracts = fs.readdirSync(contractsArtifactsPath);

        for (const contract of contracts) {

            const content = JSON.parse(fs.readFileSync(path.join(contractsArtifactsPath, contract)).toString());

            if (content.networks && content.networks[netId] && content.networks[netId].address) {
                repo_log.success(`loaded live ${mod}::${contract}`);
                finalValue[mod].live[contract] = content;
            } else {
                repo_log.success(`loaded ${mod}::${contract}`);
                finalValue[mod].lib[contract] = content;
            }

        }

    }

    fs.writeFileSync(from_root(process.env.ARTIFACT_BUNDLE_TARGET_PATH), JSON.stringify(finalValue, null, 4));

}

