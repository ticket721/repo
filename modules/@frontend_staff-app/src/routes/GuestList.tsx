import { InvisibleStatusBarMargin } from '@frontend/core/lib/utils/InvisibleStatusBarMargin';
import { TopNavMargin }             from '@frontend/core/lib/utils/TopNavMargin';
import List              from '../screens/List';

export default InvisibleStatusBarMargin(TopNavMargin(List));
