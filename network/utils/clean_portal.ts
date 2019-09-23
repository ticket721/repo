import { Portalize }   from 'portalize';
import { from_root }   from '../../gulp/utils/from_root';

/**
 * Utility to clean all `network` related actions from the portal
 */
export async function clean_portal(): Promise<void> {
    Portalize.get.setPortal(from_root('./network/portal'));
    Portalize.get.setModuleName('network');
    Portalize.get.clean();
}
