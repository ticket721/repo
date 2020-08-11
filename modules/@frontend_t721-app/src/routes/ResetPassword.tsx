import { ResetPassword }   from '@frontend/core/lib/components';
import { InvisibleStatusBarMargin } from '@frontend/core/lib/utils/InvisibleStatusBarMargin';
import { TopNavMargin }             from '@frontend/core/lib/utils/TopNavMargin';
import { DesktopWarning }  from '../utils/DesktopWarning';

export default DesktopWarning(InvisibleStatusBarMargin(TopNavMargin(ResetPassword)));
