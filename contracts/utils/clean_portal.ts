import { Portalize }   from 'portalize';
import { from_root }   from '../../gulp/utils/from_root';

/**
 * Utility to clean all `network` related actions from the portal
 */
export async function clean_portal(): Promise<void> {
    Portalize.get.setPortal(from_root('./contracts/portal'));
    Portalize.get.setModuleName('contracts');
    Portalize.get.clean();
}
