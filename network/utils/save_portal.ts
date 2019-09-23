import { Portalize }     from 'portalize';
import { from_root }     from '../../gulp/utils/from_root';
import { NetworkConfig } from '../config';

/**
 * Utility to save configuration to portal.
 *
 * @param config
 */
export async function save_portal(config: NetworkConfig): Promise<void> {
    Portalize.get.setPortal(from_root('./network/portal'));
    Portalize.get.setModuleName('network');

    Portalize.get.add('network.json', config);
}
