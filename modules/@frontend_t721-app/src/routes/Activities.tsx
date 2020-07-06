import { InvisibleStatusBarMargin } from '../utils/InvisibleStatusBarMargin';
import { TopNavMargin }             from '../utils/TopNavMargin';
import Activities                   from '@frontend/core/lib/components/Profile/Activities';

export default InvisibleStatusBarMargin(TopNavMargin(Activities));
