import Activities                   from '@frontend/core/lib/components/Profile/Activities';
import { InvisibleStatusBarMargin } from '@frontend/core/lib/utils/InvisibleStatusBarMargin';
import { TopNavMargin }             from '@frontend/core/lib/utils/TopNavMargin';

export default InvisibleStatusBarMargin(TopNavMargin(Activities));
