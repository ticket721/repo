import Cart                         from '../screens/Cart';
import { InvisibleStatusBarMargin } from '@frontend/core/lib/utils/InvisibleStatusBarMargin';
import { TopNavMargin }             from '@frontend/core/lib/utils/TopNavMargin';

export default InvisibleStatusBarMargin(TopNavMargin(Cart));
