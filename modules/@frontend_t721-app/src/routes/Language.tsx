import Language                     from '@frontend/core/lib/components/Profile/Language';
import { InvisibleStatusBarMargin } from '@frontend/core/lib/utils/margins/InvisibleStatusBarMargin';
import { TopNavMargin }             from '@frontend/core/lib/utils/margins/TopNavMargin';

export default InvisibleStatusBarMargin(TopNavMargin(Language));
