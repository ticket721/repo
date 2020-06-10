import { series }                                            from 'gulp';
import { required_config }                                   from './gulp/tasks/common';
import { network_clean, network_run }                        from './gulp/tasks/network';
import { contracts_clean, contracts_run, convert_artifacts } from './gulp/tasks/contracts';

module.exports = {
    'network::run': series(required_config, network_run),
    'network::clean': series(required_config, network_clean),
    'contracts::run': series(required_config, contracts_run),
    'contracts::clean': series(required_config, contracts_clean),
    'contracts::convert_artifacts': series(required_config, convert_artifacts),
};

