import { InvisibleStatusBarMargin } from '@frontend/core/lib/utils/InvisibleStatusBarMargin';
import { TopNavMargin }             from '@frontend/core/lib/utils/TopNavMargin';
import Stats              from '../screens/Stats';

export default InvisibleStatusBarMargin(TopNavMargin(Stats));
