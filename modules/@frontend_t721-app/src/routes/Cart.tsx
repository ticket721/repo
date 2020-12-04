import { InvisibleStatusBarMargin } from '@frontend/core/lib/utils/margins/InvisibleStatusBarMargin';
import { TopNavMargin }             from '@frontend/core/lib/utils/margins/TopNavMargin';
import { WIP }                      from './WIP';

export default InvisibleStatusBarMargin(TopNavMargin(WIP));
